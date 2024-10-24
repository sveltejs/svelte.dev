<!--@component
Provides a list of svg icons that can be referenced through the `Icon` component
-->
<div style="display: none">
	<!-- wrapper div allows use of innerHTML -->
	<svg>
		<symbol id="arrow-left" class="icon" viewBox="0 0 24 24">
			<line x1="19" y1="12" x2="5" y2="12" />
			<polyline points="12 19 5 12 12 5" />
		</symbol>

		<symbol id="arrow-right" class="icon" viewBox="0 0 24 24">
			<line x1="5" y1="12" x2="19" y2="12" />
			<polyline points="12 5 19 12 12 19" />
		</symbol>

		<symbol id="arrow-right-chevron" viewBox="0 0 24 24">
			<path
				fill="currentColor"
				d="M8.7 17.3q-.275-.275-.275-.7t.275-.7l3.9-3.9l-3.9-3.9q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275l4.6 4.6q.15.15.213.325t.062.375q0 .2-.063.375t-.212.325l-4.6 4.6q-.275.275-.7.275t-.7-.275Z"
			/>
		</symbol>

		<symbol id="arrow-up" class="icon" viewBox="0 0 24 24">
			<line x1="12" y1="19" x2="12" y2="5" />
			<polyline points="5 12 12 5 19 12" />
		</symbol>

		<symbol id="arrow-down" class="icon" viewBox="0 0 24 24">
			<line x1="12" y1="5" x2="12" y2="19" />
			<polyline points="19 12 12 19 5 12" />
		</symbol>

		<symbol id="check" class="icon" viewBox="0 0 24 24">
			<polyline points="20 6 9 17 4 12" />
		</symbol>

		<symbol id="close" class="icon" viewBox="0 0 24 24">
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</symbol>

		<symbol id="download" class="icon" viewBox="0 0 24 24">
			<path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" />
			<polyline points="7 10 12 15 17 10" />
			<line x1="12" y1="15" x2="12" y2="3" />
		</symbol>

		<symbol id="edit" class="icon" viewBox="0 0 24 24">
			<path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
			<polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
		</symbol>

		<symbol id="git-branch" class="icon" viewBox="0 0 24 24">
			<line x1="6" y1="3" x2="6" y2="15" />
			<circle cx="18" cy="6" r="3" />
			<circle cx="6" cy="18" r="3" />
			<path d="M18 9a9 9 0 0 1-9 9" />
		</symbol>

		<symbol id="log-in" class="icon" viewBox="0 0 24 24">
			<path d="M15 3H19A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H15" />
			<polyline points="10 17 15 12 10 7" />
			<line x1="15" y1="12" x2="3" y2="12" />
		</symbol>

		<symbol id="maximize" class="icon" viewBox="0 0 24 24">
			<path
				d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
			/>
		</symbol>

		<symbol id="maximize-2" class="icon" viewBox="0 0 24 24">
			<polyline points="15 3 21 3 21 9" />
			<polyline points="9 21 3 21 3 15" />
			<line x1="21" y1="3" x2="14" y2="10" />
			<line x1="3" y1="21" x2="10" y2="14" />
		</symbol>

		<symbol id="menu" viewBox="0 0 48 48">
			<path
				fill="none"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="4"
				d="M7.95 11.95h32m-32 12h32m-32 12h32"
			/>
		</symbol>

		<symbol id="message-square" class="icon" viewBox="0 0 24 24">
			<g transform="translate(0, 1)">
				<path
					d="M16.5 19H11V15H18V11H22V19H19.5L18 20.5L16.5 19Z"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M2 3H18V15H8.5L6.5 17L4.5 15H2V3 M5 10L5 12L10 12L10 10  M5 6L5 9L13 9L13 6Z"
					fill="currentColor"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</g>
		</symbol>

		<symbol id="minus" class="icon" viewBox="0 0 24 24">
			<line x1="5" y1="12" x2="19" y2="12" />
		</symbol>

		<symbol id="plus" class="icon" viewBox="0 0 24 24">
			<line x1="12" y1="5" x2="12" y2="19" />
			<line x1="5" y1="12" x2="19" y2="12" />
		</symbol>

		<symbol id="save" class="icon" viewBox="0 0 24 24">
			<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
			<polyline points="17 21 17 13 7 13 7 21" />
			<polyline points="7 3 7 8 15 8" />
		</symbol>

		<symbol id="link" class="icon" viewBox="0 0 24 24">
			<path d="M9,7L6,7A2 2 0 0 0 6,17L9,17" />
			<path d="M15,7L18,7A2 2 0 0 1 18,17L15,17" />
			<path d="M7,12L17,12" />
		</symbol>

		<symbol viewBox="0 0 24 24" id="external-link">
			<path
				fill="currentColor"
				stroke-width="0"
				d="m16 8.4l-8.875 8.9q-.3.3-.713.3t-.712-.3q-.3-.3-.3-.713t.3-.712L14.6 7H7q-.425 0-.713-.288T6 6q0-.425.288-.713T7 5h10q.425 0 .713.288T18 6v10q0 .425-.288.713T17 17q-.425 0-.713-.288T16 16V8.4Z"
			/>
		</symbol>

		<symbol id="chevron-up" class="icon" viewBox="0 0 24 24">
			<polyline points="18 15 12 9 6 15" />
		</symbol>

		<symbol id="chevron-down" class="icon" viewBox="0 0 24 24">
			<path d="m6 9 6 6 6-6" />
		</symbol>

		<symbol id="delete" class="icon" viewBox="0 0 24 24">
			<path
				fill="currentColor"
				stroke="none"
				d="M22 4.2h-5.6L15 1.6c-.1-.2-.4-.4-.7-.4H9.6c-.2 0-.5.2-.6.4L7.6 4.2H2c-.4 0-.8.4-.8.8s.4.8.8.8h1.8V22c0 .4.3.8.8.8h15c.4 0 .8-.3.8-.8V5.8H22c.4 0 .8-.3.8-.8s-.4-.8-.8-.8zM10.8 16.5c0 .4-.3.8-.8.8s-.8-.3-.8-.8V10c0-.4.3-.8.8-.8s.8.3.8.8v6.5zm4 0c0 .4-.3.8-.8.8s-.8-.3-.8-.8V10c0-.4.3-.8.8-.8s.8.3.8.8v6.5z"
			/>
		</symbol>

		<symbol id="home" viewBox="0 0 256 256">
			<path
				fill="currentColor"
				d="m221.56 100.85l-79.95-75.47l-.16-.15a19.93 19.93 0 0 0-26.91 0l-.17.15l-79.93 75.47a20.07 20.07 0 0 0-6.44 14.7V208a20 20 0 0 0 20 20h48a20 20 0 0 0 20-20v-44h24v44a20 20 0 0 0 20 20h48a20 20 0 0 0 20-20v-92.45a20.07 20.07 0 0 0-6.44-14.7ZM204 204h-40v-44a20 20 0 0 0-20-20h-32a20 20 0 0 0-20 20v44H52v-86.72l76-71.75l76 71.75Z"
			/>
		</symbol>

		<symbol id="search" viewBox="0 0 24 24">
			<path
				stroke-width="0.2"
				fill="currentColor"
				d="m18.9 20.3l-5.6-5.6q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5q0-2.725 1.888-4.612T9.5 3q2.725 0 4.612 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.625 5.625q.275.275.275.675t-.3.7q-.275.275-.7.275t-.7-.275ZM9.5 14q1.875 0 3.188-1.313T14 9.5q0-1.875-1.313-3.188T9.5 5Q7.625 5 6.312 6.313T5 9.5q0 1.875 1.313 3.188T9.5 14Z"
			/>
		</symbol>

		<symbol id="docs" viewBox="0 0 16 16">
			<path
				fill="currentColor"
				d="M1 3.25C1 2.56 1.56 2 2.249 2h.5c.69 0 1.248.56 1.248 1.25v9.495c0 .69-.559 1.25-1.248 1.25h-.5A1.25 1.25 0 0 1 1 12.744V3.249ZM2.249 3a.25.25 0 0 0-.25.25v9.495c0 .138.112.25.25.25h.5a.25.25 0 0 0 .25-.25V3.249a.25.25 0 0 0-.25-.25h-.5Zm2.748.25c0-.69.559-1.25 1.249-1.25h.5c.689 0 1.248.56 1.248 1.25v9.495c0 .69-.56 1.25-1.249 1.25h-.5a1.25 1.25 0 0 1-1.248-1.25V3.249ZM6.246 3a.25.25 0 0 0-.25.25v9.495c0 .138.112.25.25.25h.5a.25.25 0 0 0 .249-.25V3.249a.25.25 0 0 0-.25-.25h-.5Zm5.726 1.777a1.249 1.249 0 0 0-1.57-.713l-.583.204a1.25 1.25 0 0 0-.746 1.645l2.937 7.304c.249.62.94.933 1.571.713l.582-.204a1.25 1.25 0 0 0 .746-1.646l-2.937-7.303Zm-1.24.23a.25.25 0 0 1 .313.143l2.937 7.303a.25.25 0 0 1-.149.33l-.582.203a.25.25 0 0 1-.314-.142L10 5.54a.25.25 0 0 1 .149-.329l.582-.204Z"
			/>
		</symbol>

		<symbol id="contents" viewBox="0 0 256 256" stroke-width="0">
			<path
				fill="currentColor"
				d="M224 44h-64a43.86 43.86 0 0 0-32 13.85A43.86 43.86 0 0 0 96 44H32a20 20 0 0 0-20 20v128a20 20 0 0 0 20 20h64a20 20 0 0 1 20 20a12 12 0 0 0 24 0a20 20 0 0 1 20-20h64a20 20 0 0 0 20-20V64a20 20 0 0 0-20-20ZM96 188H36V68h60a20 20 0 0 1 20 20v104.81A43.79 43.79 0 0 0 96 188Zm124 0h-60a43.71 43.71 0 0 0-20 4.83V88a20 20 0 0 1 20-20h60Z"
			/>
		</symbol>

		<symbol viewBox="0 0 24 24" id="copy-to-clipboard-empty">
			<path
				fill="currentColor"
				d="M5 22q-.825 0-1.413-.588T3 20V6h2v14h11v2H5Zm4-4q-.825 0-1.413-.588T7 16V4q0-.825.588-1.413T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.588 1.413T18 18H9Zm0-2h9V4H9v12Zm0 0V4v12Z"
			/>
		</symbol>

		<symbol viewBox="0 0 24 24" id="copy-to-clipboard-filled">
			<path
				fill="currentColor"
				d="M5 22q-.825 0-1.413-.588T3 20V6h2v14h11v2H5Zm4-4q-.825 0-1.413-.588T7 16V4q0-.825.588-1.413T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.588 1.413T18 18H9Z"
			/>
		</symbol>

		<symbol viewBox="0 0 24 24" id="font-toggle">
			<g stroke="currentColor">
				<path d="m3 15 4-8 4 8" />
				<path d="M4 13h6" />
				<circle cx="18" cy="12" r="3" />
				<path d="M21 9v6" />
			</g>
		</symbol>
	</svg>
</div>
