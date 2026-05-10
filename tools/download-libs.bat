@echo off
echo ========================================
echo Tai KaTeX offline cho giao trinh dien tu
echo ========================================

echo.
echo Dang tai katex.min.css...
curl -sL -o "lib\katex\katex.min.css" "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"

echo Dang tai katex.min.js...
curl -sL -o "lib\katex\katex.min.js" "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"

echo Dang tai auto-render.min.js...
curl -sL -o "lib\katex\auto-render.min.js" "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"

echo Dang tai KaTeX fonts...
mkdir "lib\katex\fonts" 2>nul

set FONT_BASE=https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/fonts
for %%f in (KaTeX_Main-Regular.woff2 KaTeX_Main-Bold.woff2 KaTeX_Main-Italic.woff2 KaTeX_Math-Italic.woff2 KaTeX_Math-BoldItalic.woff2 KaTeX_Size1-Regular.woff2 KaTeX_Size2-Regular.woff2 KaTeX_Size3-Regular.woff2 KaTeX_Size4-Regular.woff2 KaTeX_AMS-Regular.woff2 KaTeX_Caligraphic-Bold.woff2 KaTeX_Caligraphic-Regular.woff2 KaTeX_Fraktur-Bold.woff2 KaTeX_Fraktur-Regular.woff2 KaTeX_SansSerif-Bold.woff2 KaTeX_SansSerif-Italic.woff2 KaTeX_SansSerif-Regular.woff2 KaTeX_Script-Regular.woff2 KaTeX_Typewriter-Regular.woff2) do (
  echo   Font: %%f
  curl -sL -o "lib\katex\fonts\%%f" "%FONT_BASE%/%%f"
)

echo Dang tai Three.js...
curl -sL -o "lib\three\three.module.min.js" "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.min.js"

echo.
echo ========================================
echo HOAN TAT! Kiem tra thu muc lib\
echo ========================================
dir /s /b lib\katex\*.css lib\katex\*.js lib\three\*.js 2>nul
pause
