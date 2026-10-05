'use strict';
// Parse HTML before TeX, exactly as a browser's text layer must precede KaTeX.
// This is syntax/accessibility-output verification, not layout or mathematical proof.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {execFileSync}=require('node:child_process'),katex=require('../lib/katex/katex.min.js');
const root=path.resolve(__dirname,'..');let files=0,formulas=0;
for(const file of fs.readdirSync(path.join(root,'chapters'),{recursive:true}).filter(p=>p.endsWith('.html'))){
 const p=path.join(root,'chapters',file);
 const items=JSON.parse(execFileSync(process.env.PYTHON||'python',[path.join(root,'tools/extract_tex_for_validation.py'),p],{encoding:'utf8'}));
 for(const item of items){
  const rendered=katex.renderToString(item.math,{throwOnError:true,output:'htmlAndMathml',displayMode:item.display,strict:(code)=>code==='unicodeTextInMathMode'?'ignore':'error'});
  assert.match(rendered,/<math /);assert.doesNotMatch(rendered,/katex-error/);formulas++;
 }
 files++;
}
console.log(JSON.stringify({htmlFiles:files,htmlParsedTexFormulas:formulas,result:'PASS',browserLayoutVerified:false}));
