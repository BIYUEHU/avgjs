package com.misakura.demo

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import AssetHttpServer
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    private lateinit var server: AssetHttpServer

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        server = AssetHttpServer(this, 8080)
        server.start()

        webView = findViewById(R.id.webview)
//        webView.webViewClient = WebViewClient()
        webView.settings.setJavaScriptEnabled(true)
        webView.settings.setDomStorageEnabled(true)
        WebView.setWebContentsDebuggingEnabled(true)
//        webView.settings.setAppCacheEnabled(true)
//        webView.settings.setCacheMode(1024)
//        if (WebViewFeature.isFeatureSupported(WebViewFeature.FORCE_DARK)) {
//            WebViewCompat.setForceDark(webView)
//        }

//        webView.setLayerType(View.LAYER_TYPE_SOFTWARE, null)
        webView.loadUrl("http://localhost:8080/index.html")
//        webView.loadUrl("https://avg.js.org/demo.html")
    }

    override fun onDestroy() {
        super.onDestroy()
        server.stop()
    }
}