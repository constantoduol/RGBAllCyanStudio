package com.questlab.rgballcyan;

import java.io.IOException;

import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Bundle;
import android.app.Activity;
import android.content.Intent;
import android.content.res.AssetFileDescriptor;
import android.support.v4.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.MenuItem.OnMenuItemClickListener;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;

//import com.quest.rgballcyan.R;

public class GameActivity extends Activity {
    private static WebView wv = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_game);
        wv = (WebView) findViewById(R.id.html_viewer);
        WebSettings settings = wv.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setDatabasePath("/data/data/"+getPackageName()+"/databases");
        wv.loadUrl("file:///android_asset/index.html");
        AdView adView = (AdView)this.findViewById(R.id.adView);
        AdRequest adRequest = new AdRequest.Builder()
                .addTestDevice("37DCD3715F54AF6E129098236B4AD153")
                .build();
        adView.loadAd(adRequest);

    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        super.onCreateOptionsMenu(menu);
        menu.add("Settings").setOnMenuItemClickListener(new OnMenuItemClickListener() {

            @Override
            public boolean onMenuItemClick(MenuItem arg0) {
                wv.loadUrl("javascript:showMenu()");

                return false;
            }
        });
        menu.add("Help").setOnMenuItemClickListener(new OnMenuItemClickListener() {

            @Override
            public boolean onMenuItemClick(MenuItem arg0) {
                //wv.loadUrl("javascript:window.grid.showHelp()");
                startActivity(new Intent(getApplicationContext(),HelpActivity.class));
                return false;
            }
        });
        menu.add("About").setOnMenuItemClickListener(new OnMenuItemClickListener() {

            @Override
            public boolean onMenuItemClick(MenuItem arg0) {
                //wv.loadUrl("javascript:window.grid.showAbout()");
                startActivity(new Intent(getApplicationContext(),AboutActivity.class));
                return false;
            }
        });

        return true;
    }

	/*
	 public static class PlaceholderFragment extends Fragment {

	        public PlaceholderFragment() {
	        }

	        @Override
	        public View onCreateView(LayoutInflater inflater, ViewGroup container,
	                                 Bundle savedInstanceState) {
	            View rootView = inflater.inflate(R.layout.fragment_my, container, false);
	            return rootView;
	        }
	    }


	    public static class AdFragment extends Fragment {

	        private AdView mAdView;

	        public AdFragment() {
	        }

	        @Override
	        public void onActivityCreated(Bundle bundle) {
	            super.onActivityCreated(bundle);

	            // Gets the ad view defined in layout/ad_fragment.xml with ad unit ID set in
	            // values/strings.xml.
	            mAdView = (AdView) getView().findViewById(R.id.adView);

	            // Create an ad request. Check logcat output for the hashed device ID to
	            // get test ads on a physical device. e.g.
	            // "Use AdRequest.Builder.addTestDevice("ABCDEF012345") to get test ads on this device."
	            AdRequest adRequest = new AdRequest.Builder()
	                    .addTestDevice(AdRequest.DEVICE_ID_EMULATOR)
	                    .build();

	            // Start loading the ad in the background.
	            mAdView.loadAd(adRequest);
	        }

	        @Override
	        public View onCreateView(LayoutInflater inflater, ViewGroup container,
	                                 Bundle savedInstanceState) {
	            return inflater.inflate(R.layout.fragment_ad, container, false);
	        }


	        @Override
	        public void onPause() {
	            if (mAdView != null) {
	                mAdView.pause();
	            }
	            super.onPause();
	        }


	        @Override
	        public void onResume() {
	            super.onResume();
	            if (mAdView != null) {
	                mAdView.resume();
	            }
	        }


	        @Override
	        public void onDestroy() {
	            if (mAdView != null) {
	                mAdView.destroy();
	            }
	            super.onDestroy();
	        }

	    }
		*/

}
