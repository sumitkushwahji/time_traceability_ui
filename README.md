# time_tracevility_ui

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init

🛠️ Step-by-Step Angular CLI Commands
Assume your project root is:

css
Copy
Edit
src/
└── app/
└── pages/
✅ Step 1: Navigate to the pages folder
bash
Copy
Edit
cd src/app/pages
✅ Step 2: Generate faridabad module with routing
bash
Copy
Edit
ng generate module faridabad --routing
📁 This creates:

cpp
Copy
Edit
src/app/pages/faridabad/
├── faridabad.module.ts
└── faridabad-routing.module.ts
✅ Step 3: Generate the wrapper faridabad component
bash
Copy
Edit
cd faridabad
ng generate component faridabad
📁 This creates:

markdown
Copy
Edit
faridabad/
└── faridabad.component.ts
faridabad.component.html
faridabad.component.css
This will be your parent wrapper component for location-level layout.

✅ Step 4: Create the views folder
bash
Copy
Edit
mkdir views
✅ Step 5: Generate data-view and plot-view components inside views
bash
Copy
Edit
cd views
ng generate component data-view
ng generate component plot-view
📁 Now your structure looks like:

pgsql
Copy
Edit
faridabad/
├── views/
│ ├── data-view/
│ │ └── data-view.component.ts / .html / .css
│ └── plot-view/
│ └── plot-view.component.ts / .html / .css
You can move the generated files up to just views/ for simpler structure if desired.

📌 After Code Setup – Update Routing
Now follow the code setup from the earlier message to:

Configure routing in faridabad-routing.module.ts

Create the template layout in faridabad.component.html

✅ Summary of Commands
bash
Copy
Edit
cd src/app/pages
ng generate module faridabad --routing
cd faridabad
ng generate component faridabad
mkdir views
cd views
ng generate component data-view
ng generate component plot-view
Let me know if you want a script to do all this automatically, or would you like me to walk through the TopBar/RightPanel components next?

```
time_traceability_ui
├─ .angular
│  └─ cache
│     └─ 19.2.7
│        └─ time_traceability_ui
│           ├─ .tsbuildinfo
│           ├─ angular-compiler.db
│           ├─ angular-compiler.db-lock
│           └─ vite
│              ├─ deps
│              │  ├─ @angular_common.js
│              │  ├─ @angular_common.js.map
│              │  ├─ @angular_common_http.js
│              │  ├─ @angular_common_http.js.map
│              │  ├─ @angular_core.js
│              │  ├─ @angular_core.js.map
│              │  ├─ @angular_forms.js
│              │  ├─ @angular_forms.js.map
│              │  ├─ @angular_platform-browser.js
│              │  ├─ @angular_platform-browser.js.map
│              │  ├─ @angular_router.js
│              │  ├─ @angular_router.js.map
│              │  ├─ _metadata.json
│              │  ├─ chunk-2PYZ3S3O.js
│              │  ├─ chunk-2PYZ3S3O.js.map
│              │  ├─ chunk-3OV72XIM.js
│              │  ├─ chunk-3OV72XIM.js.map
│              │  ├─ chunk-AU2R3HOV.js
│              │  ├─ chunk-AU2R3HOV.js.map
│              │  ├─ chunk-LNYWYYVR.js
│              │  ├─ chunk-LNYWYYVR.js.map
│              │  ├─ chunk-NCKTJPS5.js
│              │  ├─ chunk-NCKTJPS5.js.map
│              │  ├─ chunk-P6U2JBMQ.js
│              │  ├─ chunk-P6U2JBMQ.js.map
│              │  ├─ chunk-XSXWKFPE.js
│              │  ├─ chunk-XSXWKFPE.js.map
│              │  ├─ file-saver.js
│              │  ├─ file-saver.js.map
│              │  ├─ ng2-charts.js
│              │  ├─ ng2-charts.js.map
│              │  ├─ package.json
│              │  ├─ rxjs.js
│              │  └─ rxjs.js.map
│              └─ deps_ssr
│                 ├─ @angular_common.js
│                 ├─ @angular_common.js.map
│                 ├─ @angular_common_http.js
│                 ├─ @angular_common_http.js.map
│                 ├─ @angular_core.js
│                 ├─ @angular_core.js.map
│                 ├─ @angular_forms.js
│                 ├─ @angular_forms.js.map
│                 ├─ @angular_platform-browser.js
│                 ├─ @angular_platform-browser.js.map
│                 ├─ @angular_platform-server.js
│                 ├─ @angular_platform-server.js.map
│                 ├─ @angular_router.js
│                 ├─ @angular_router.js.map
│                 ├─ @angular_ssr.js
│                 ├─ @angular_ssr.js.map
│                 ├─ @angular_ssr_node.js
│                 ├─ @angular_ssr_node.js.map
│                 ├─ _metadata.json
│                 ├─ chunk-36ZTRP43.js
│                 ├─ chunk-36ZTRP43.js.map
│                 ├─ chunk-AQYIT73X.js
│                 ├─ chunk-AQYIT73X.js.map
│                 ├─ chunk-DYCVSJ2D.js
│                 ├─ chunk-DYCVSJ2D.js.map
│                 ├─ chunk-ELZBIMTQ.js
│                 ├─ chunk-ELZBIMTQ.js.map
│                 ├─ chunk-HTIGRKW2.js
│                 ├─ chunk-HTIGRKW2.js.map
│                 ├─ chunk-QM5ZOJBD.js
│                 ├─ chunk-QM5ZOJBD.js.map
│                 ├─ chunk-T4BSGZNX.js
│                 ├─ chunk-T4BSGZNX.js.map
│                 ├─ chunk-TAMDKQTI.js
│                 ├─ chunk-TAMDKQTI.js.map
│                 ├─ chunk-TGNFVBGA.js
│                 ├─ chunk-TGNFVBGA.js.map
│                 ├─ chunk-YHCV7DAQ.js
│                 ├─ chunk-YHCV7DAQ.js.map
│                 ├─ express.js
│                 ├─ express.js.map
│                 ├─ file-saver.js
│                 ├─ file-saver.js.map
│                 ├─ ng2-charts.js
│                 ├─ ng2-charts.js.map
│                 ├─ package.json
│                 ├─ rxjs.js
│                 ├─ rxjs.js.map
│                 ├─ xhr2-TXIMV6CV.js
│                 └─ xhr2-TXIMV6CV.js.map
├─ .editorconfig
├─ .postcssrc.json
├─ README.md
├─ angular.json
├─ build-deploy-dev.sh
├─ build-deploy-prod.sh
├─ dist
│  └─ time_traceability_ui
│     ├─ 3rdpartylicenses.txt
│     ├─ browser
│     │  ├─ ahmedabad
│     │  │  ├─ data-view
│     │  │  │  └─ index.html
│     │  │  ├─ index.html
│     │  │  └─ plot-view
│     │  │     └─ index.html
│     │  ├─ assets
│     │  │  └─ img
│     │  │     ├─ lm-logo.png
│     │  │     ├─ npl.png
│     │  │     ├─ npl2.png
│     │  │     └─ npli.svg
│     │  ├─ bangalore
│     │  │  ├─ data-view
│     │  │  │  └─ index.html
│     │  │  ├─ index.html
│     │  │  └─ plot-view
│     │  │     └─ index.html
│     │  ├─ bhubaneshwar
│     │  │  ├─ data-view
│     │  │  │  └─ index.html
│     │  │  ├─ index.html
│     │  │  └─ plot-view
│     │  │     └─ index.html
│     │  ├─ chunk-3SXEBPBZ.js
│     │  ├─ chunk-C5NVXVYF.js
│     │  ├─ chunk-FSMKC6AY.js
│     │  ├─ chunk-IXPT6PGR.js
│     │  ├─ chunk-O36B7WQW.js
│     │  ├─ chunk-OTT2CSKV.js
│     │  ├─ chunk-OUYMWVNA.js
│     │  ├─ chunk-S3FB3MSV.js
│     │  ├─ chunk-SXVW4R77.js
│     │  ├─ chunk-XUALMERZ.js
│     │  ├─ dashboard
│     │  │  ├─ data-view
│     │  │  │  └─ index.html
│     │  │  ├─ file-availability
│     │  │  │  └─ index.html
│     │  │  ├─ index.html
│     │  │  ├─ link-stats
│     │  │  │  └─ index.html
│     │  │  └─ plot-view
│     │  │     └─ index.html
│     │  ├─ drc
│     │  │  ├─ data-view
│     │  │  │  └─ index.html
│     │  │  ├─ index.html
│     │  │  └─ plot-view
│     │  │     └─ index.html
│     │  ├─ faridabad
│     │  │  ├─ data-view
│     │  │  │  └─ index.html
│     │  │  ├─ index.html
│     │  │  └─ plot-view
│     │  │     └─ index.html
│     │  ├─ favicon.ico
│     │  ├─ guwahati
│     │  │  ├─ data-view
│     │  │  │  └─ index.html
│     │  │  ├─ index.html
│     │  │  └─ plot-view
│     │  │     └─ index.html
│     │  ├─ home
│     │  │  └─ index.html
│     │  ├─ index.csr.html
│     │  ├─ index.html
│     │  ├─ main-HSNBT62I.js
│     │  ├─ polyfills-FFHMD2TL.js
│     │  ├─ scripts-MSUZSTRG.js
│     │  └─ styles-UKSD6QWY.css
│     ├─ prerendered-routes.json
│     └─ server
│        ├─ angular-app-engine-manifest.mjs
│        ├─ angular-app-manifest.mjs
│        ├─ assets-chunks
│        │  ├─ ahmedabad_data-view_index_html.mjs
│        │  ├─ ahmedabad_index_html.mjs
│        │  ├─ ahmedabad_plot-view_index_html.mjs
│        │  ├─ bangalore_data-view_index_html.mjs
│        │  ├─ bangalore_index_html.mjs
│        │  ├─ bangalore_plot-view_index_html.mjs
│        │  ├─ bhubaneshwar_data-view_index_html.mjs
│        │  ├─ bhubaneshwar_index_html.mjs
│        │  ├─ bhubaneshwar_plot-view_index_html.mjs
│        │  ├─ dashboard_data-view_index_html.mjs
│        │  ├─ dashboard_file-availability_index_html.mjs
│        │  ├─ dashboard_index_html.mjs
│        │  ├─ dashboard_link-stats_index_html.mjs
│        │  ├─ dashboard_plot-view_index_html.mjs
│        │  ├─ drc_data-view_index_html.mjs
│        │  ├─ drc_index_html.mjs
│        │  ├─ drc_plot-view_index_html.mjs
│        │  ├─ faridabad_data-view_index_html.mjs
│        │  ├─ faridabad_index_html.mjs
│        │  ├─ faridabad_plot-view_index_html.mjs
│        │  ├─ guwahati_data-view_index_html.mjs
│        │  ├─ guwahati_index_html.mjs
│        │  ├─ guwahati_plot-view_index_html.mjs
│        │  ├─ home_index_html.mjs
│        │  ├─ index_csr_html.mjs
│        │  ├─ index_html.mjs
│        │  ├─ index_server_html.mjs
│        │  └─ styles-UKSD6QWY_css.mjs
│        ├─ chunk-4IXTXHO4.mjs
│        ├─ chunk-EJSJJTUO.mjs
│        ├─ chunk-FE3ZEMPP.mjs
│        ├─ chunk-GFUZYSQG.mjs
│        ├─ chunk-KKM7H7EV.mjs
│        ├─ chunk-LPVHWPB4.mjs
│        ├─ chunk-RHC6P54U.mjs
│        ├─ chunk-RW6ZAT3H.mjs
│        ├─ chunk-S6KH3LOX.mjs
│        ├─ chunk-UCLZ6LHB.mjs
│        ├─ chunk-UZORZY4C.mjs
│        ├─ chunk-WH27Q3IC.mjs
│        ├─ chunk-XRE7YKYX.mjs
│        ├─ chunk-YISOM52Y.mjs
│        ├─ index.server.html
│        ├─ main.server.mjs
│        ├─ polyfills.server.mjs
│        └─ server.mjs
├─ package-lock.json
├─ package.json
├─ project
├─ project.pub
├─ public
│  └─ favicon.ico
├─ src
│  ├─ app
│  │  ├─ app.component.css
│  │  ├─ app.component.html
│  │  ├─ app.component.spec.ts
│  │  ├─ app.component.ts
│  │  ├─ app.config.server.ts
│  │  ├─ app.config.ts
│  │  ├─ app.routes.server.ts
│  │  ├─ app.routes.ts
│  │  ├─ layout
│  │  │  ├─ layout.component.css
│  │  │  ├─ layout.component.html
│  │  │  ├─ layout.component.spec.ts
│  │  │  ├─ layout.component.ts
│  │  │  ├─ navbar
│  │  │  │  ├─ navbar.component.css
│  │  │  │  ├─ navbar.component.html
│  │  │  │  ├─ navbar.component.spec.ts
│  │  │  │  └─ navbar.component.ts
│  │  │  └─ sidebar
│  │  │     ├─ sidebar.component.css
│  │  │     ├─ sidebar.component.html
│  │  │     ├─ sidebar.component.spec.ts
│  │  │     └─ sidebar.component.ts
│  │  ├─ models
│  │  │  ├─ sat-data.model.ts
│  │  │  └─ session-status.model.ts
│  │  ├─ pages
│  │  │  ├─ ahmedabad
│  │  │  │  ├─ ahmedabad-routing.module.ts
│  │  │  │  ├─ ahmedabad.component.css
│  │  │  │  ├─ ahmedabad.component.html
│  │  │  │  ├─ ahmedabad.component.spec.ts
│  │  │  │  ├─ ahmedabad.component.ts
│  │  │  │  ├─ ahmedabad.module.ts
│  │  │  │  └─ views
│  │  │  │     ├─ data-view
│  │  │  │     │  ├─ data-view.component.css
│  │  │  │     │  ├─ data-view.component.html
│  │  │  │     │  ├─ data-view.component.spec.ts
│  │  │  │     │  └─ data-view.component.ts
│  │  │  │     └─ plot-view
│  │  │  │        ├─ plot-view.component.css
│  │  │  │        ├─ plot-view.component.html
│  │  │  │        ├─ plot-view.component.spec.ts
│  │  │  │        └─ plot-view.component.ts
│  │  │  ├─ bangalore
│  │  │  │  ├─ bangalore-routing.module.ts
│  │  │  │  ├─ bangalore.component.css
│  │  │  │  ├─ bangalore.component.html
│  │  │  │  ├─ bangalore.component.spec.ts
│  │  │  │  ├─ bangalore.component.ts
│  │  │  │  ├─ bangalore.module.ts
│  │  │  │  └─ views
│  │  │  │     ├─ data-view
│  │  │  │     │  ├─ data-view.component.css
│  │  │  │     │  ├─ data-view.component.html
│  │  │  │     │  ├─ data-view.component.spec.ts
│  │  │  │     │  └─ data-view.component.ts
│  │  │  │     └─ plot-view
│  │  │  │        ├─ plot-view.component.css
│  │  │  │        ├─ plot-view.component.html
│  │  │  │        ├─ plot-view.component.spec.ts
│  │  │  │        └─ plot-view.component.ts
│  │  │  ├─ bhubaneshwar
│  │  │  │  ├─ bhubaneshwar-routing.module.ts
│  │  │  │  ├─ bhubaneshwar.component.css
│  │  │  │  ├─ bhubaneshwar.component.html
│  │  │  │  ├─ bhubaneshwar.component.spec.ts
│  │  │  │  ├─ bhubaneshwar.component.ts
│  │  │  │  ├─ bhubaneshwar.module.ts
│  │  │  │  └─ views
│  │  │  │     ├─ data-view
│  │  │  │     │  ├─ data-view.component.css
│  │  │  │     │  ├─ data-view.component.html
│  │  │  │     │  ├─ data-view.component.spec.ts
│  │  │  │     │  └─ data-view.component.ts
│  │  │  │     └─ plot-view
│  │  │  │        ├─ plot-view.component.css
│  │  │  │        ├─ plot-view.component.html
│  │  │  │        ├─ plot-view.component.spec.ts
│  │  │  │        └─ plot-view.component.ts
│  │  │  ├─ dashboard
│  │  │  │  ├─ dashboard-routing.module.ts
│  │  │  │  ├─ dashboard.component.css
│  │  │  │  ├─ dashboard.component.html
│  │  │  │  ├─ dashboard.component.spec.ts
│  │  │  │  ├─ dashboard.component.ts
│  │  │  │  ├─ dashboard.module.ts
│  │  │  │  └─ views
│  │  │  │     ├─ data-completeness-dashboard
│  │  │  │     │  ├─ data-completeness-dashboard.component.css
│  │  │  │     │  ├─ data-completeness-dashboard.component.html
│  │  │  │     │  ├─ data-completeness-dashboard.component.spec.ts
│  │  │  │     │  └─ data-completeness-dashboard.component.ts
│  │  │  │     ├─ data-view
│  │  │  │     │  ├─ data-view.component.css
│  │  │  │     │  ├─ data-view.component.html
│  │  │  │     │  ├─ data-view.component.spec.ts
│  │  │  │     │  └─ data-view.component.ts
│  │  │  │     ├─ file-availability
│  │  │  │     │  ├─ file-availability.component.css
│  │  │  │     │  ├─ file-availability.component.html
│  │  │  │     │  ├─ file-availability.component.spec.ts
│  │  │  │     │  └─ file-availability.component.ts
│  │  │  │     └─ plot-view
│  │  │  │        ├─ plot-view.component.css
│  │  │  │        ├─ plot-view.component.html
│  │  │  │        ├─ plot-view.component.spec.ts
│  │  │  │        └─ plot-view.component.ts
│  │  │  ├─ drc
│  │  │  │  ├─ drc-routing.module.ts
│  │  │  │  ├─ drc.component.css
│  │  │  │  ├─ drc.component.html
│  │  │  │  ├─ drc.component.spec.ts
│  │  │  │  ├─ drc.component.ts
│  │  │  │  ├─ drc.module.ts
│  │  │  │  └─ views
│  │  │  │     ├─ data-view
│  │  │  │     │  ├─ data-view.component.css
│  │  │  │     │  ├─ data-view.component.html
│  │  │  │     │  ├─ data-view.component.spec.ts
│  │  │  │     │  └─ data-view.component.ts
│  │  │  │     └─ plot-view
│  │  │  │        ├─ plot-view.component.css
│  │  │  │        ├─ plot-view.component.html
│  │  │  │        ├─ plot-view.component.spec.ts
│  │  │  │        └─ plot-view.component.ts
│  │  │  ├─ faridabad
│  │  │  │  ├─ faridabad-routing.module.ts
│  │  │  │  ├─ faridabad.component.css
│  │  │  │  ├─ faridabad.component.html
│  │  │  │  ├─ faridabad.component.spec.ts
│  │  │  │  ├─ faridabad.component.ts
│  │  │  │  ├─ faridabad.module.ts
│  │  │  │  └─ views
│  │  │  │     ├─ data-view
│  │  │  │     │  ├─ data-view.component.css
│  │  │  │     │  ├─ data-view.component.html
│  │  │  │     │  ├─ data-view.component.spec.ts
│  │  │  │     │  └─ data-view.component.ts
│  │  │  │     └─ plot-view
│  │  │  │        ├─ plot-view.component.css
│  │  │  │        ├─ plot-view.component.html
│  │  │  │        ├─ plot-view.component.spec.ts
│  │  │  │        └─ plot-view.component.ts
│  │  │  ├─ guwahati
│  │  │  │  ├─ guwahati-routing.module.ts
│  │  │  │  ├─ guwahati.component.css
│  │  │  │  ├─ guwahati.component.html
│  │  │  │  ├─ guwahati.component.spec.ts
│  │  │  │  ├─ guwahati.component.ts
│  │  │  │  ├─ guwahati.module.ts
│  │  │  │  └─ views
│  │  │  │     ├─ data-view
│  │  │  │     │  ├─ data-view.component.css
│  │  │  │     │  ├─ data-view.component.html
│  │  │  │     │  ├─ data-view.component.spec.ts
│  │  │  │     │  └─ data-view.component.ts
│  │  │  │     └─ plot-view
│  │  │  │        ├─ plot-view.component.css
│  │  │  │        ├─ plot-view.component.html
│  │  │  │        ├─ plot-view.component.spec.ts
│  │  │  │        └─ plot-view.component.ts
│  │  │  └─ home
│  │  │     ├─ home.component.css
│  │  │     ├─ home.component.html
│  │  │     ├─ home.component.spec.ts
│  │  │     └─ home.component.ts
│  │  ├─ pipes
│  │  │  └─ ceil.pipe.ts
│  │  ├─ services
│  │  │  ├─ data-completeness.service.ts
│  │  │  ├─ data.service.ts
│  │  │  ├─ date-range.service.ts
│  │  │  ├─ export.service.ts
│  │  │  ├─ filter.service.ts
│  │  │  ├─ platform.service.ts
│  │  │  ├─ sat-data.service.ts
│  │  │  └─ session-status.service.ts
│  │  └─ shared
│  │     ├─ right-panel
│  │     │  ├─ right-panel.component.css
│  │     │  ├─ right-panel.component.html
│  │     │  ├─ right-panel.component.spec.ts
│  │     │  └─ right-panel.component.ts
│  │     └─ top-buttons
│  │        ├─ top-buttons.component.css
│  │        ├─ top-buttons.component.html
│  │        ├─ top-buttons.component.spec.ts
│  │        └─ top-buttons.component.ts
│  ├─ assets
│  │  └─ img
│  │     ├─ lm-logo.png
│  │     ├─ npl.png
│  │     ├─ npl2.png
│  │     └─ npli.svg
│  ├─ environments
│  │  ├─ environment.prod.ts
│  │  └─ environment.ts
│  ├─ index.html
│  ├─ main.server.ts
│  ├─ main.ts
│  ├─ server.ts
│  └─ styles.css
├─ tsconfig.app.json
├─ tsconfig.json
└─ tsconfig.spec.json

```