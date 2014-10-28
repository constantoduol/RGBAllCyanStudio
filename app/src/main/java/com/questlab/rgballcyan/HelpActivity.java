package com.questlab.rgballcyan;

import android.app.Activity;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.RelativeLayout;

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;

public class HelpActivity extends Activity{
    private static WebView wv = null;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_help);
        wv = (WebView) findViewById(R.id.help_viewer);
        wv.loadUrl("file:///android_asset/help.html");
        AdView adView = (AdView)this.findViewById(R.id.adView);
        AdRequest adRequest = new AdRequest.Builder()
                .addTestDevice("37DCD3715F54AF6E129098236B4AD153")
                .build();
        adView.loadAd(adRequest);
    }



}
