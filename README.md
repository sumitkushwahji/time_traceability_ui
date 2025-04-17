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
