📝 Web App: Journaling + Timeline

⸻

🧭 User Journey
	1.	User visits the site: somewebsite .com.
	2.	Sees a calendar on the left sidebar.
	3.	Clicks on a specific date in the calendar.
	4.	A custom in-browser (not the system popup of the browser) pop-up appears prompting for:
	•	Title
	•	Description (with Markdown support)
	•	Checkbox: “Add to timeline”
	5.	On entering title and description, Save button is enabled.
	6.	On save:
	•	A card is created under the “Events” section.
	•	The card includes title, description, date, and a note on timeline inclusion.

⸻

🖼️ App Layout
	•	Left Sidebar:
	•	Contains the calendar for selecting dates.
	•	Right Workspace Area:
	•	At the top center: A toggle switch between two modes:
	•	Events (default view)
	•	Timeline
	•	Below the toggle, the content dynamically changes based on the mode.

⸻

📋 Events View (Default)
	•	Displays event cards added for various dates.
	•	Each card shows:
	•	Title
	•	Description
	•	Date
	•	Timeline checkbox status
	•	Edit button (toggles card between editable and read-only mode)

🛠️ Edit Behavior
	•	When Edit is clicked:
	•	The card becomes editable inline (no pop-up).
	•	Title and description can be updated directly.
	•	The edit button changes to a Save button for confirming edits.
	•	Multiple entries for the same date are allowed and listed accordingly.

⸻

⏱️ Timeline View
	•	Displays a vertical timeline (center-aligned line with alternating cards on left and right for space efficiency).
	•	Only includes events where the “Add to timeline” checkbox is ticked.

🧭 Timeline Features
	•	Date Range Selector: Choose the range of dates to view events.
	•	View Modes:
	•	Day View
	•	Week View
	•	Month View
	•	Custom Start Selector:
	•	For Week or Month view modes, users can pick the starting week/month for the timeline display.

⸻

🧑‍💻 Developer Notes (optional)
	•	All event data can be persisted in local storage, user account, or synced via cloud for continuity.
	•	Markdown rendering can be supported via libraries like marked.js or Showdown.