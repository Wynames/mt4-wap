// file: android-template/app/src/main/java/com/template/webview/MainActivity.kt
package com.template.webview

import android.content.Context
import android.graphics.Color
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    // This placeholder gets replaced by CI/CD
    private var targetUrl = "__TARGET_URL__"

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout

    // Feature toggles (can be overridden via build config if needed)
    private val enableAntiScreenshot = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (enableAntiScreenshot) {
            window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        }

        if (isOnline()) {
            loadMainWebView()
        } else {
            showOfflineLayout()
        }
    }

    private fun loadMainWebView() {
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)

        setupWebView()
        setupSwipeRefresh()

        webView.loadUrl(targetUrl)
    }

    private fun setupWebView() {
        webView.apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.useWideViewPort = true
            settings.loadWithOverviewMode = true
            settings.userAgentString =
                "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36"

            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    injectWatermark()
                }

                @Deprecated("Deprecated in Java")
                override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                    view?.loadUrl(url ?: return false)
                    return true
                }

                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    view?.loadUrl(request?.url.toString())
                    return true
                }
            }

            webChromeClient = WebChromeClient()
        }
    }

    private fun injectWatermark() {
        val js = """
            (function() {
                // Remove existing watermark if any
                var existing = document.getElementById('xt4-watermark');
                if (existing) existing.remove();
                
                var div = document.createElement('div');
                div.id = 'xt4-watermark';
                div.innerHTML = 'Created via Our Builder';
                div.style.position = 'fixed';
                div.style.bottom = '0';
                div.style.left = '0';
                div.style.width = '100%';
                div.style.backgroundColor = 'rgba(0,0,0,0.8)';
                div.style.color = '#ffffff';
                div.style.textAlign = 'center';
                div.style.padding = '8px';
                div.style.fontSize = '12px';
                div.style.zIndex = '999999';
                div.style.fontFamily = 'sans-serif';
                document.body.appendChild(div);
            })();
        """.trimIndent()

        webView.evaluateJavascript(js, null)
    }

    private fun setupSwipeRefresh() {
        swipeRefreshLayout.setColorSchemeColors(Color.WHITE, Color.GRAY)
        swipeRefreshLayout.setOnRefreshListener {
            webView.reload()
            swipeRefreshLayout.isRefreshing = false
        }
    }

    private fun isOnline(): Boolean {
        val cm = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val capabilities = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            cm.getNetworkCapabilities(cm.activeNetwork)
        } else {
            @Suppress("DEPRECATION")
            cm.activeNetworkInfo?.let { info ->
                val caps = NetworkCapabilities.Builder().build()
                // Fallback: assume online if info exists and is connected
                if (info.isConnected) caps else null
            }
        }
        return capabilities?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true
    }

    private fun showOfflineLayout() {
        setContentView(R.layout.layout_offline)
        // Style the retry button programmatically
        val retryButton = findViewById<android.widget.Button>(R.id.retryButton)
        retryButton.setBackgroundColor(Color.WHITE)
        retryButton.setTextColor(Color.BLACK)
        retryButton.setOnClickListener {
            if (isOnline()) {
                loadMainWebView()
            }
        }
    }
}
