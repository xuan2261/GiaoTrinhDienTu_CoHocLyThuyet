param(
    [string]$OutputDir = (Join-Path $PSScriptRoot '../../assets/designs/bao-cao-hoi-dong-nang-cao-33-slides'),
    [string]$PptxName = 'bao-cao-hoi-dong-nang-cao.pptx',
    [ValidateRange(1, 1000)][int]$ExpectedSlides = 34,
    [ValidateRange(1, 10000)][int]$PreviewWidth = 1280,
    [ValidateRange(1, 10000)][int]$PreviewHeight = 720,
    [ValidateRange(0, 10)][double]$OverflowTolerancePoints = 0.75
)

# Read-only native export. Run with PowerPoint closed to protect user documents.
# powershell -NoProfile -ExecutionPolicy Bypass -File tools/presentation/advanced-export-deck.ps1
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Release-ComReference {
    param([object]$Reference)
    if ($null -ne $Reference -and [System.Runtime.InteropServices.Marshal]::IsComObject($Reference)) {
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($Reference)
    }
}

function New-Rectangle {
    param([double]$Left, [double]$Top, [double]$Width, [double]$Height)
    return [ordered]@{
        left = [Math]::Round($Left, 3)
        top = [Math]::Round($Top, 3)
        width = [Math]::Round($Width, 3)
        height = [Math]::Round($Height, 3)
    }
}

function Get-Overflow {
    param([object]$TextBounds, [object]$ContainerBounds)
    # Compute with unrounded native coordinates; JSON rounding is display-only.
    return [ordered]@{
        left = [Math]::Max(0.0, $ContainerBounds.left - $TextBounds.left)
        top = [Math]::Max(0.0, $ContainerBounds.top - $TextBounds.top)
        right = [Math]::Max(0.0, ($TextBounds.left + $TextBounds.width) - ($ContainerBounds.left + $ContainerBounds.width))
        bottom = [Math]::Max(0.0, ($TextBounds.top + $TextBounds.height) - ($ContainerBounds.top + $ContainerBounds.height))
    }
}

function Inspect-Shape {
    param(
        [object]$Shape,
        [int]$SlideNumber,
        [string]$ShapePath,
        [double]$SlideWidth,
        [double]$SlideHeight,
        [System.Collections.Generic.List[object]]$Frames,
        [System.Collections.Generic.List[object]]$Overflows,
        [bool]$IsTableCell = $false
    )

    $frame = $null
    $range = $null
    $font = $null
    try {
        if ($Shape.Type -eq 6) {
            $group = $null
            try {
                $group = $Shape.GroupItems
                for ($index = 1; $index -le $group.Count; $index++) {
                    $child = $null
                    try {
                        $child = $group.Item($index)
                        Inspect-Shape $child $SlideNumber "$ShapePath/group[$index]" $SlideWidth $SlideHeight $Frames $Overflows $IsTableCell
                    }
                    finally { Release-ComReference $child }
                }
            }
            finally { Release-ComReference $group }
            return
        }

        if ($Shape.HasTable -eq -1) {
            $table = $null
            $rows = $null
            $columns = $null
            try {
                $table = $Shape.Table
                $rows = $table.Rows
                $columns = $table.Columns
                for ($row = 1; $row -le $rows.Count; $row++) {
                    for ($column = 1; $column -le $columns.Count; $column++) {
                        $cell = $null
                        $cellShape = $null
                        try {
                            $cell = $table.Cell($row, $column)
                            $cellShape = $cell.Shape
                            Inspect-Shape $cellShape $SlideNumber "$ShapePath/cell[$row,$column]" $SlideWidth $SlideHeight $Frames $Overflows $true
                        }
                        finally {
                            Release-ComReference $cellShape
                            Release-ComReference $cell
                        }
                    }
                }
            }
            finally {
                Release-ComReference $columns
                Release-ComReference $rows
                Release-ComReference $table
            }
            return
        }

        if ($Shape.HasTextFrame -ne -1) { return }
        $frame = $Shape.TextFrame2
        if ($frame.HasText -ne -1) { return }
        $range = $frame.TextRange
        $text = ([string]$range.Text).Replace("`r`n", "`n").Replace("`r", "`n")
        if ([string]::IsNullOrWhiteSpace($text)) { return }
        $font = $range.Font

        $nativeBounds = @{
            left = [double]$range.BoundLeft
            top = [double]$range.BoundTop
            width = [double]$range.BoundWidth
            height = [double]$range.BoundHeight
        }
        $contentBounds = @{
            left = [double]$Shape.Left + [double]$frame.MarginLeft
            top = [double]$Shape.Top + [double]$frame.MarginTop
            width = [Math]::Max(0.0, [double]$Shape.Width - [double]$frame.MarginLeft - [double]$frame.MarginRight)
            height = [Math]::Max(0.0, [double]$Shape.Height - [double]$frame.MarginTop - [double]$frame.MarginBottom)
        }
        if ($IsTableCell) {
            # PowerPoint exposes unpositioned/local cell BoundLeft and BoundTop.
            # Only native text dimensions can be compared to the cell interior.
            $measurementMode = 'table-cell-dimensions-only'
            $reportedContentBounds = [ordered]@{
                width = [Math]::Round($contentBounds.width, 3)
                height = [Math]::Round($contentBounds.height, 3)
            }
            $reportedNativeBounds = [ordered]@{
                width = [Math]::Round($nativeBounds.width, 3)
                height = [Math]::Round($nativeBounds.height, 3)
            }
            $frameOverflow = [ordered]@{
                width = [Math]::Max(0.0, $nativeBounds.width - $contentBounds.width)
                height = [Math]::Max(0.0, $nativeBounds.height - $contentBounds.height)
            }
            $slideOverflow = $null
        }
        else {
            $measurementMode = 'positioned-native-text-bounds'
            $reportedContentBounds = New-Rectangle $contentBounds.left $contentBounds.top $contentBounds.width $contentBounds.height
            $reportedNativeBounds = New-Rectangle $nativeBounds.left $nativeBounds.top $nativeBounds.width $nativeBounds.height
            $slideBounds = @{ left = 0.0; top = 0.0; width = $SlideWidth; height = $SlideHeight }
            $frameOverflow = Get-Overflow $nativeBounds $contentBounds
            $slideOverflow = Get-Overflow $nativeBounds $slideBounds
        }
        $hasOverflow = $false
        foreach ($dimension in @($frameOverflow.Keys)) {
            if ($frameOverflow[$dimension] -gt $OverflowTolerancePoints) { $hasOverflow = $true }
            $frameOverflow[$dimension] = [Math]::Round($frameOverflow[$dimension], 3)
        }
        if ($null -ne $slideOverflow) {
            foreach ($edge in @($slideOverflow.Keys)) {
                if ($slideOverflow[$edge] -gt $OverflowTolerancePoints) { $hasOverflow = $true }
                $slideOverflow[$edge] = [Math]::Round($slideOverflow[$edge], 3)
            }
        }

        $record = [ordered]@{
            slide = $SlideNumber
            shapeId = [int]$Shape.Id
            shapeName = [string]$Shape.Name
            shapePath = $ShapePath
            text = $text
            fontName = [string]$font.Name
            rotationDegrees = [Math]::Round([double]$Shape.Rotation, 3)
            shapeBounds = New-Rectangle $Shape.Left $Shape.Top $Shape.Width $Shape.Height
            measurementMode = $measurementMode
            contentBounds = $reportedContentBounds
            nativeTextBounds = $reportedNativeBounds
            slideBoundsInspected = -not $IsTableCell
            frameOverflowPoints = $frameOverflow
            slideOverflowPoints = $slideOverflow
            overflow = $hasOverflow
        }
        $Frames.Add($record)
        if ($hasOverflow) {
            $Overflows.Add($record)
            Write-Warning ("Text overflow on slide {0}, shape '{1}' ({2}): {3}" -f $SlideNumber, $Shape.Name, $ShapePath, $text.Replace("`n", ' | '))
        }
    }
    catch {
        throw "Native text inspection failed on slide $SlideNumber at ${ShapePath}: $($_.Exception.Message)"
    }
    finally {
        Release-ComReference $font
        Release-ComReference $range
        Release-ComReference $frame
    }
}

if ([Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT) {
    throw 'This exporter requires Windows and installed Microsoft PowerPoint.'
}
if ([IO.Path]::GetFileName($PptxName) -ne $PptxName -or [IO.Path]::GetExtension($PptxName) -ine '.pptx') {
    throw 'PptxName must be a .pptx filename without directory components.'
}
$output = [IO.Path]::GetFullPath($OutputDir)
$pptx = Join-Path $output $PptxName
if (-not (Test-Path -LiteralPath $pptx -PathType Leaf)) {
    throw "Generated presentation not found: $pptx. Run advanced-build-deck.js first."
}
if (@(Get-Process -Name POWERPNT -ErrorAction SilentlyContinue).Count -gt 0) {
    throw 'PowerPoint is already running. Close it yourself before exporting; this script will not touch user presentations.'
}

$pdf = [IO.Path]::ChangeExtension($pptx, '.pdf')
$previewDir = Join-Path $output 'previews'
$inspectionPath = Join-Path $output 'layout-inspection.json'
[void][IO.Directory]::CreateDirectory($previewDir)
$frames = New-Object 'System.Collections.Generic.List[object]'
$overflows = New-Object 'System.Collections.Generic.List[object]'
$app = $null
$presentations = $null
$presentation = $null
$slides = $null
$pageSetup = $null
$ownsSession = $false

try {
    $app = New-Object -ComObject PowerPoint.Application
    $presentations = $app.Presentations
    if ($presentations.Count -ne 0) {
        throw 'PowerPoint acquired an existing presentation during startup. No user documents were changed.'
    }
    $ownsSession = $true
    $nativeVersion = [string]$app.Version
    # MsoTriState: read-only = -1, untitled = 0, with-window = 0.
    $presentation = $presentations.Open($pptx, -1, 0, 0)
    $slides = $presentation.Slides
    $slideCount = [int]$slides.Count
    if ($slideCount -ne $ExpectedSlides) {
        throw "Expected $ExpectedSlides slides, but PowerPoint opened $slideCount. Export cancelled."
    }
    $pageSetup = $presentation.PageSetup
    $slideWidth = [double]$pageSetup.SlideWidth
    $slideHeight = [double]$pageSetup.SlideHeight

    # ppSaveAsPDF = 32; writes the PDF target only, never saves the source PPTX.
    $presentation.SaveAs($pdf, 32)
    if (-not (Test-Path -LiteralPath $pdf -PathType Leaf) -or (Get-Item -LiteralPath $pdf).Length -eq 0) {
        throw "PowerPoint did not produce a non-empty PDF: $pdf"
    }
    for ($number = 1; $number -le $slideCount; $number++) {
        $slide = $null
        $shapes = $null
        try {
            $slide = $slides.Item($number)
            $imagePath = Join-Path $previewDir ('slide-{0:D2}.png' -f $number)
            $slide.Export($imagePath, 'PNG', $PreviewWidth, $PreviewHeight)
            if (-not (Test-Path -LiteralPath $imagePath -PathType Leaf) -or (Get-Item -LiteralPath $imagePath).Length -eq 0) {
                throw "PowerPoint did not produce a non-empty preview: $imagePath"
            }
            $shapes = $slide.Shapes
            for ($index = 1; $index -le $shapes.Count; $index++) {
                $shape = $null
                try {
                    $shape = $shapes.Item($index)
                    Inspect-Shape $shape $number "shape[$index]" $slideWidth $slideHeight $frames $overflows
                }
                finally { Release-ComReference $shape }
            }
        }
        finally {
            Release-ComReference $shapes
            Release-ComReference $slide
        }
    }
    $report = [ordered]@{
        presentation = $PptxName
        pdf = [IO.Path]::GetFileName($pdf)
        previewDirectory = 'previews'
        slideCount = $slideCount
        nativeVersion = $nativeVersion
        expectedFont = 'Arial'
        measuredAtUtc = [DateTime]::UtcNow.ToString('o')
        units = 'points'
        slideSize = @{ width = $slideWidth; height = $slideHeight }
        overflowTolerancePoints = $OverflowTolerancePoints
        measurement = 'PowerPoint TextFrame2.TextRange native bounds against margin-inset frame and slide bounds for positioned shapes. Table cells use native text width/height against content width/height only; their unpositioned native coordinates are not treated as global or checked against slide bounds. Native end-marker overhang observations are retained. Rotated shapes include their rotation for visual review.'
        inspectedTextFrameCount = $frames.Count
        overflowCount = $overflows.Count
        textFrames = $frames.ToArray()
        overflows = $overflows.ToArray()
    }
    $json = ConvertTo-Json -InputObject $report -Depth 12
    [IO.File]::WriteAllText($inspectionPath, $json, (New-Object System.Text.UTF8Encoding($false)))
    Write-Output ("Exported {0} slides using PowerPoint {1}; native text overflows: {2}." -f $slideCount, $nativeVersion, $overflows.Count)
    Write-Output $pdf
    Write-Output $previewDir
    Write-Output $inspectionPath
}
finally {
    Release-ComReference $pageSetup
    Release-ComReference $slides
    try {
        if ($null -ne $presentation) { $presentation.Close() }
    }
    finally {
        Release-ComReference $presentation
        try {
            if ($ownsSession -and $null -ne $app -and $null -ne $presentations) {
                if ($presentations.Count -eq 0) {
                    $app.Quit()
                }
                else {
                    Write-Warning 'Another presentation is now open. PowerPoint was left running to protect user documents.'
                }
            }
        }
        finally {
            Release-ComReference $presentations
            Release-ComReference $app
            [GC]::Collect()
            [GC]::WaitForPendingFinalizers()
        }
    }
}
