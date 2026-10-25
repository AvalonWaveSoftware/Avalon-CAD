package com.tristan.cad;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.util.Base64;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import org.json.JSONObject;
import java.io.*;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
    private WebView web;
    private FrameLayout root;
    private long lastRendererCrash=-1;
    private volatile boolean recoveryPending=false, recoveryBlank=false;
    private File stagingFile;
    private FileOutputStream stagingStream;
    private String outputName,outputMime;
    private boolean exportError=false, awaitingSave=false;
    private final ExecutorService files=Executors.newSingleThreadExecutor();
    private static final int SAVE=40,OPEN=41,MAX_FILE=50*1024*1024;
    private static final String ORIGIN="appassets.androidplatform.net";
    // WS8 (PARALLEL_INIT, mirrored by build-web.mjs into assets/perf-flags.json): WebView cache on, ?v=<version> assets
    // served immutable so V8 can keep their compiled code. Missing or false keeps LOAD_NO_CACHE and plain responses.
    private boolean parallelInit=false;private String assetVersion=null;
    private void readStartupFlags(){try(InputStream in=getAssets().open("perf-flags.json")){ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] b=new byte[4096];int n;while((n=in.read(b))>0)out.write(b,0,n);
        JSONObject flags=new JSONObject(out.toString("UTF-8"));parallelInit=flags.optBoolean("PARALLEL_INIT",false);assetVersion=flags.optString("version",null);}catch(Exception e){parallelInit=false;}}
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(16,25,31));
        getWindow().setNavigationBarColor(Color.rgb(16,25,31));
        root=new FrameLayout(this);root.setBackgroundColor(Color.rgb(16,25,31));
        setContentView(root);
        root.setOnApplyWindowInsetsListener((v,insets)->{
            if(android.os.Build.VERSION.SDK_INT>=30){android.graphics.Insets i=insets.getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.displayCutout()|WindowInsets.Type.ime());v.setPadding(i.left,i.top,i.right,i.bottom);}
            else v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });root.requestApplyInsets();
        readStartupFlags();
        if(state!=null&&state.getString("pending")!=null){File pending=new File(getCacheDir(),state.getString("pending"));if(pending.isFile()){stagingFile=pending;outputName=state.getString("name");outputMime=state.getString("mime");awaitingSave=state.getBoolean("awaiting");}}
        createWebView();
    }
    private void createWebView(){
        web=new WebView(this);web.setBackgroundColor(Color.rgb(16,25,31));
        root.addView(web,new FrameLayout.LayoutParams(-1,-1));root.requestApplyInsets();
        WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setCacheMode(parallelInit?WebSettings.LOAD_DEFAULT:WebSettings.LOAD_NO_CACHE);s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setAllowFileAccessFromFileURLs(false);s.setAllowUniversalAccessFromFileURLs(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);s.setMediaPlaybackRequiresUserGesture(true);s.setSupportMultipleWindows(false);
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient(){
            @Override public boolean onRenderProcessGone(WebView view,android.webkit.RenderProcessGoneDetail detail){
                long now=android.os.SystemClock.elapsedRealtime();
                recoveryBlank=lastRendererCrash>=0&&now-lastRendererCrash<=60000;
                lastRendererCrash=now;recoveryPending=true;
                synchronized(MainActivity.this){closeStage();outputName=null;outputMime=null;awaitingSave=false;exportError=false;}
                root.removeView(view);view.removeJavascriptInterface("Android");view.destroy();
                createWebView();return true;
            }
            @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest request){return true;}
            @Override public WebResourceResponse shouldInterceptRequest(WebView v,WebResourceRequest request){
                Uri uri=request.getUrl();
                if("https".equals(uri.getScheme())&&ORIGIN.equals(uri.getHost())) {
                    String path=uri.getPath();if(path!=null&&path.startsWith("/assets/")&&!path.contains("..")){
                        String asset=path.substring(8),mime="application/octet-stream";
                        if(asset.endsWith(".html"))mime="text/html";else if((asset.endsWith(".js")||asset.endsWith(".mjs")))mime="text/javascript";else if(asset.endsWith(".json"))mime="application/json";else if(asset.endsWith(".py"))mime="text/plain";else if(asset.endsWith(".css"))mime="text/css";else if(asset.endsWith(".wasm"))mime="application/wasm";
                        if(parallelInit){try{Map<String,String> headers=new HashMap<>();boolean versioned=assetVersion!=null&&assetVersion.equals(uri.getQueryParameter("v"));
                            headers.put("Cache-Control",versioned?"public, max-age=31536000, immutable":"no-store");
                            return new WebResourceResponse(mime,"UTF-8",200,"OK",headers,getAssets().open(asset));}catch(IOException e){return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",new HashMap<>(),new ByteArrayInputStream(new byte[0]));}}
                        try{return new WebResourceResponse(mime,"UTF-8",getAssets().open(asset));}catch(IOException e){return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",new HashMap<>(),new ByteArrayInputStream(new byte[0]));}
                    }
                }
                return new WebResourceResponse("text/plain","UTF-8",403,"Blocked",new HashMap<>(),new ByteArrayInputStream(new byte[0]));
            }
        });
        web.addJavascriptInterface(new Bridge(),"Android");
        web.loadUrl("https://"+ORIGIN+"/assets/index.html");
    }
    class Bridge {
        @JavascriptInterface public synchronized boolean recovered(){boolean value=recoveryPending;recoveryPending=false;return value;}
        @JavascriptInterface public boolean recoveryBlank(){return recoveryBlank;}
        // BEGIN TEST_RENDERER_CRASH_HOOK (removed from release source by build-apk.sh)
        @JavascriptInterface public void debugCrashRenderer(){runOnUiThread(()->{
            if(android.os.Build.VERSION.SDK_INT>=29&&web.getWebViewRenderProcess()!=null)web.getWebViewRenderProcess().terminate();
        });}
        // END TEST_RENDERER_CRASH_HOOK
        @JavascriptInterface public synchronized void beginFile(String name,String mime){
            exportError=false;
            if(awaitingSave){exportError=true;notice("Finish saving the previous file first.",true);return;}
            try{closeStage();stagingFile=File.createTempFile("cad-export-",".tmp",getCacheDir());stagingStream=new FileOutputStream(stagingFile);outputName=name.replaceAll("[^a-zA-Z0-9._-]","_");outputMime=("model/stl".equals(mime)?"model/stl":"application/json");}catch(IOException e){exportError=true;notice("Could not prepare the export.",true);}
        }
        @JavascriptInterface public synchronized void appendFile(String data){
            if(exportError||stagingStream==null)return;
            try{if(stagingFile.length()>MAX_FILE)throw new IOException("Too large");stagingStream.write(Base64.decode(data,Base64.DEFAULT));}catch(Exception e){exportError=true;notice("Export exceeded available storage or the 50 MB limit.",true);closeStage();}
        }
        @JavascriptInterface public synchronized void finishFile(){
            if(exportError||stagingStream==null)return;
            try{stagingStream.close();stagingStream=null;}catch(IOException e){notice("Could not finish export.",true);closeStage();return;}
            awaitingSave=true;
            runOnUiThread(()->{try{Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType(outputMime);i.putExtra(Intent.EXTRA_TITLE,outputName);startActivityForResult(i,SAVE);}catch(Exception e){awaitingSave=false;notice("The Android file picker could not open.",true);closeStage();}});
        }
        @JavascriptInterface public void openFile(){runOnUiThread(()->{try{Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("*/*");startActivityForResult(i,OPEN);}catch(Exception e){notice("The Android file picker could not open.",true);}});}
    }
    private synchronized void closeStage(){if(stagingStream!=null)try{stagingStream.close();}catch(Exception ignored){}stagingStream=null;if(stagingFile!=null)stagingFile.delete();stagingFile=null;}
    private void notice(String message,boolean error){runOnUiThread(()->{if(!isDestroyed())web.evaluateJavascript("window.nativeNotice&&window.nativeNotice("+JSONObject.quote(message)+","+error+")",null);});}
    @Override protected void onActivityResult(int request,int result,Intent data){
        super.onActivityResult(request,result,data);
        if(request==SAVE){
            if(!awaitingSave||stagingFile==null)return;
            if(result!=RESULT_OK||data==null||data.getData()==null){awaitingSave=false;closeStage();notice("Save canceled. Your model is still open.",false);return;}
            final Uri uri=data.getData();final File source=stagingFile;
            files.execute(()->{try(InputStream in=new FileInputStream(source);OutputStream out=getContentResolver().openOutputStream(uri,"wt")){if(out==null)throw new IOException();byte[] buf=new byte[32768];int n;while((n=in.read(buf))!=-1)out.write(buf,0,n);out.flush();notice("File saved. You can open it from My Files.",false);}catch(Exception e){notice("Could not save the file. Try another folder.",true);}finally{closeStage();awaitingSave=false;}});
        }else if(request==OPEN&&result==RESULT_OK&&data!=null&&data.getData()!=null){
            final Uri uri=data.getData();
            files.execute(()->{try{String name="model.stl";try(Cursor c=getContentResolver().query(uri,new String[]{OpenableColumns.DISPLAY_NAME},null,null,null)){if(c!=null&&c.moveToFirst())name=c.getString(0);}
                try(InputStream in=getContentResolver().openInputStream(uri);ByteArrayOutputStream out=new ByteArrayOutputStream()){if(in==null)throw new IOException();byte[] buf=new byte[32768];int n;while((n=in.read(buf))!=-1){if(out.size()+n>MAX_FILE)throw new IOException("File too large");out.write(buf,0,n);}String encoded=Base64.encodeToString(out.toByteArray(),Base64.NO_WRAP);final String label=name;runOnUiThread(()->web.evaluateJavascript("window.nativeImportStart("+JSONObject.quote(label)+")",ignored->sendImport(encoded,0)));}
            }catch(Exception e){notice("Could not read the file. Imports are limited to 50 MB.",true);}});
        }
    }
    private void sendImport(String encoded,int at){if(at>=encoded.length()){web.evaluateJavascript("window.nativeImportEnd()",null);return;}int end=Math.min(at+32768,encoded.length());web.evaluateJavascript("window.nativeImportChunk("+JSONObject.quote(encoded.substring(at,end))+")",ignored->sendImport(encoded,end));}
    @Override protected void onSaveInstanceState(Bundle state){super.onSaveInstanceState(state);if(stagingFile!=null){state.putString("pending",stagingFile.getName());state.putString("name",outputName);state.putString("mime",outputMime);state.putBoolean("awaiting",awaitingSave);}}
    @Override public void onBackPressed(){web.evaluateJavascript("window.handleBack?window.handleBack():false",result->{if(!"true".equals(result))super.onBackPressed();});}
    @Override protected void onPause(){super.onPause();web.onPause();}
    @Override protected void onResume(){super.onResume();if(web!=null)web.onResume();}
    @Override protected void onDestroy(){files.shutdown();if(!awaitingSave)closeStage();web.removeJavascriptInterface("Android");web.destroy();super.onDestroy();}
}
