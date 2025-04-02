<script>
	import contributors from './contributors.js';
	import donors from './donors.js';

	// @ts-expect-error
	import contributors_img from './contributors.jpg?format=webp';
	// @ts-expect-error
	import donors_img from './donors.jpg?format=webp';
</script>

<p class="intro">
	Backed by <a href="https://vercel.com" target="_blank" rel="noreferrer">Vercel</a> and countless donors,
	developed by full-time and part-time maintainers, Svelte is here to stay.
</p>

<div class="wrapper">
	<div class="layout">
		<div class="supporters">
			{#each contributors as contributor, i}
				<a
					class="supporter"
					style="background-position: {(100 * i) / (contributors.length - 1)}% 0"
					style:background-image="url({contributors_img})"
					href="https://github.com/{contributor}"
				>
					{contributor}
				</a>
			{/each}

			{#each donors as donor, i}
				<a
					class="supporter"
					style="background-position: {(100 * i) / (donors.length - 1)}% 0"
					style:background-image="url({donors_img})"
					href="https://opencollective.com/svelte">{donor}</a
				>
			{/each}
		</div>
	</div>
</div>

<style>
	.wrapper {
		width: 100%;
		overflow: hidden;
	}

	.intro {
		margin: 1em auto 3.2rem auto;
		text-wrap: balance;
		text-align: center;
		max-width: 27em;
		padding: 0 var(--sk-page-padding-side);
	}

	.layout {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin: 0 -1rem;
	}

	.supporters {
		--columns: 12;
		position: relative;
		display: grid;
		grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
		grid-gap: 1rem;
		mask-size: 100%;
		mask-image: radial-gradient(ellipse min(50vw, 100rem) 500%, white, white 70%, transparent);
		width: 100%;
		max-width: 200rem;
		margin: 0 auto;

		@media (min-width: 480px) {
			--columns: 16;
		}

		@media (min-width: 720px) {
			--columns: 24;
		}

		@media (min-width: 1000px) {
			--columns: 32;
		}

		@media (min-width: 1600px) {
			--columns: 48;
		}
	}

	.supporter {
		width: 100%;
		aspect-ratio: 1;
		border-radius: 50%;
		text-indent: -9999px;
		display: inline-block;
		background: no-repeat;
		background-size: auto 102%;
		filter: grayscale(1) opacity(0.7);
		transform: var(--safari-fix);
		-webkit-transform: var(--safari-fix);
		order: calc((var(--columns) * (var(--row) - 1)) + var(--column));

		/** assign 8 rows... */
		&:nth-child(n + 1):nth-child(-n + 12) {
			--row: 1;
		}

		&:nth-child(n + 13):nth-child(-n + 24) {
			--row: 2;
		}

		&:nth-child(n + 25):nth-child(-n + 36) {
			--row: 3;
		}

		&:nth-child(n + 37):nth-child(-n + 48) {
			--row: 4;
		}

		&:nth-child(n + 49):nth-child(-n + 60) {
			--row: 5;
		}

		&:nth-child(n + 61):nth-child(-n + 72) {
			--row: 6;
		}

		&:nth-child(n + 73):nth-child(-n + 84) {
			--row: 7;
		}

		&:nth-child(n + 85):nth-child(-n + 96) {
			--row: 8;
		}

		/** ...of 12 columns */
		&:nth-child(12n + 1) {
			--column: 6;
		}

		&:nth-child(12n + 2) {
			--column: 7;
		}

		&:nth-child(12n + 3) {
			--column: 5;
		}

		&:nth-child(12n + 4) {
			--column: 8;
		}

		&:nth-child(12n + 5) {
			--column: 4;
		}

		&:nth-child(12n + 6) {
			--column: 9;
		}

		&:nth-child(12n + 7) {
			--column: 3;
		}

		&:nth-child(12n + 8) {
			--column: 10;
		}

		&:nth-child(12n + 9) {
			--column: 2;
		}

		&:nth-child(12n + 10) {
			--column: 11;
		}

		&:nth-child(12n + 11) {
			--column: 1;
		}

		&:nth-child(12n + 12) {
			--column: 12;
		}

		@media (min-width: 480px) {
			/** assign 6 rows... */
			&:nth-child(n + 1):nth-child(-n + 16) {
				--row: 1;
			}

			&:nth-child(n + 17):nth-child(-n + 32) {
				--row: 2;
			}

			&:nth-child(n + 33):nth-child(-n + 48) {
				--row: 3;
			}

			&:nth-child(n + 49):nth-child(-n + 64) {
				--row: 4;
			}

			&:nth-child(n + 65):nth-child(-n + 80) {
				--row: 5;
			}

			&:nth-child(n + 81):nth-child(-n + 96) {
				--row: 6;
			}

			/** ...of 16 columns */
			&:nth-child(16n + 1) {
				--column: 8;
			}

			&:nth-child(16n + 2) {
				--column: 9;
			}

			&:nth-child(16n + 3) {
				--column: 7;
			}

			&:nth-child(16n + 4) {
				--column: 10;
			}

			&:nth-child(16n + 5) {
				--column: 6;
			}

			&:nth-child(16n + 6) {
				--column: 11;
			}

			&:nth-child(16n + 7) {
				--column: 5;
			}

			&:nth-child(16n + 8) {
				--column: 12;
			}

			&:nth-child(16n + 9) {
				--column: 4;
			}

			&:nth-child(16n + 10) {
				--column: 13;
			}

			&:nth-child(16n + 11) {
				--column: 3;
			}

			&:nth-child(16n + 12) {
				--column: 14;
			}

			&:nth-child(16n + 13) {
				--column: 2;
			}

			&:nth-child(16n + 14) {
				--column: 15;
			}

			&:nth-child(16n + 15) {
				--column: 1;
			}

			&:nth-child(16n + 16) {
				--column: 16;
			}
		}

		@media (min-width: 720px) {
			/** assign 4 rows... */
			&:nth-child(n + 1):nth-child(-n + 24) {
				--row: 1;
			}

			&:nth-child(n + 25):nth-child(-n + 48) {
				--row: 2;
			}

			&:nth-child(n + 49):nth-child(-n + 72) {
				--row: 3;
			}

			&:nth-child(n + 73):nth-child(-n + 96) {
				--row: 4;
			}

			/** ...of 24 columns */
			&:nth-child(24n + 1) {
				--column: 12;
			}

			&:nth-child(24n + 2) {
				--column: 13;
			}

			&:nth-child(24n + 3) {
				--column: 11;
			}

			&:nth-child(24n + 4) {
				--column: 14;
			}

			&:nth-child(24n + 5) {
				--column: 10;
			}

			&:nth-child(24n + 6) {
				--column: 15;
			}

			&:nth-child(24n + 7) {
				--column: 9;
			}

			&:nth-child(24n + 8) {
				--column: 16;
			}

			&:nth-child(24n + 9) {
				--column: 8;
			}

			&:nth-child(24n + 10) {
				--column: 17;
			}

			&:nth-child(24n + 11) {
				--column: 7;
			}

			&:nth-child(24n + 12) {
				--column: 18;
			}

			&:nth-child(24n + 13) {
				--column: 6;
			}

			&:nth-child(24n + 14) {
				--column: 19;
			}

			&:nth-child(24n + 15) {
				--column: 5;
			}

			&:nth-child(24n + 16) {
				--column: 20;
			}

			&:nth-child(24n + 17) {
				--column: 4;
			}

			&:nth-child(24n + 18) {
				--column: 21;
			}

			&:nth-child(24n + 19) {
				--column: 3;
			}

			&:nth-child(24n + 20) {
				--column: 22;
			}

			&:nth-child(24n + 21) {
				--column: 2;
			}

			&:nth-child(24n + 22) {
				--column: 23;
			}

			&:nth-child(24n + 23) {
				--column: 1;
			}

			&:nth-child(24n + 24) {
				--column: 24;
			}
		}

		@media (min-width: 1000px) {
			/** assign 3 rows... */
			&:nth-child(n + 1):nth-child(-n + 32) {
				--row: 1;
			}

			&:nth-child(n + 33):nth-child(-n + 64) {
				--row: 2;
			}

			&:nth-child(n + 65):nth-child(-n + 96) {
				--row: 3;
			}

			/** ...of 36 columns */
			&:nth-child(36n + 1) {
				--column: 18;
			}

			&:nth-child(36n + 2) {
				--column: 19;
			}

			&:nth-child(36n + 3) {
				--column: 17;
			}

			&:nth-child(36n + 4) {
				--column: 20;
			}

			&:nth-child(36n + 5) {
				--column: 16;
			}

			&:nth-child(36n + 6) {
				--column: 21;
			}

			&:nth-child(36n + 7) {
				--column: 15;
			}

			&:nth-child(36n + 8) {
				--column: 22;
			}

			&:nth-child(36n + 9) {
				--column: 14;
			}

			&:nth-child(36n + 10) {
				--column: 23;
			}

			&:nth-child(36n + 11) {
				--column: 13;
			}

			&:nth-child(36n + 12) {
				--column: 24;
			}

			&:nth-child(36n + 13) {
				--column: 12;
			}

			&:nth-child(36n + 14) {
				--column: 25;
			}

			&:nth-child(36n + 15) {
				--column: 11;
			}

			&:nth-child(36n + 16) {
				--column: 26;
			}

			&:nth-child(36n + 17) {
				--column: 10;
			}

			&:nth-child(36n + 18) {
				--column: 27;
			}

			&:nth-child(36n + 19) {
				--column: 9;
			}

			&:nth-child(36n + 20) {
				--column: 28;
			}

			&:nth-child(36n + 21) {
				--column: 8;
			}

			&:nth-child(36n + 22) {
				--column: 29;
			}

			&:nth-child(36n + 23) {
				--column: 7;
			}

			&:nth-child(36n + 24) {
				--column: 30;
			}

			&:nth-child(36n + 25) {
				--column: 6;
			}

			&:nth-child(36n + 26) {
				--column: 31;
			}

			&:nth-child(36n + 27) {
				--column: 5;
			}

			&:nth-child(36n + 28) {
				--column: 32;
			}

			&:nth-child(36n + 29) {
				--column: 4;
			}

			&:nth-child(36n + 30) {
				--column: 33;
			}

			&:nth-child(36n + 31) {
				--column: 3;
			}

			&:nth-child(36n + 32) {
				--column: 34;
			}

			&:nth-child(36n + 33) {
				--column: 2;
			}

			&:nth-child(36n + 34) {
				--column: 35;
			}

			&:nth-child(36n + 35) {
				--column: 1;
			}

			&:nth-child(36n + 36) {
				--column: 36;
			}
		}

		@media (min-width: 1600px) {
			/** assign 2 rows... */
			&:nth-child(n + 1):nth-child(-n + 48) {
				--row: 1;
			}

			&:nth-child(n + 49):nth-child(-n + 96) {
				--row: 2;
			}

			/** ...of 48 columns */
			&:nth-child(48n + 1) {
				--column: 24;
			}

			&:nth-child(48n + 2) {
				--column: 25;
			}

			&:nth-child(48n + 3) {
				--column: 23;
			}

			&:nth-child(48n + 4) {
				--column: 26;
			}

			&:nth-child(48n + 5) {
				--column: 22;
			}

			&:nth-child(48n + 6) {
				--column: 27;
			}

			&:nth-child(48n + 7) {
				--column: 21;
			}

			&:nth-child(48n + 8) {
				--column: 28;
			}

			&:nth-child(48n + 9) {
				--column: 20;
			}

			&:nth-child(48n + 10) {
				--column: 29;
			}

			&:nth-child(48n + 11) {
				--column: 19;
			}

			&:nth-child(48n + 12) {
				--column: 30;
			}

			&:nth-child(48n + 13) {
				--column: 18;
			}

			&:nth-child(48n + 14) {
				--column: 31;
			}

			&:nth-child(48n + 15) {
				--column: 17;
			}

			&:nth-child(48n + 16) {
				--column: 32;
			}

			&:nth-child(48n + 17) {
				--column: 16;
			}

			&:nth-child(48n + 18) {
				--column: 33;
			}

			&:nth-child(48n + 19) {
				--column: 15;
			}

			&:nth-child(48n + 20) {
				--column: 34;
			}

			&:nth-child(48n + 21) {
				--column: 14;
			}

			&:nth-child(48n + 22) {
				--column: 35;
			}

			&:nth-child(48n + 23) {
				--column: 13;
			}

			&:nth-child(48n + 24) {
				--column: 36;
			}

			&:nth-child(48n + 25) {
				--column: 12;
			}

			&:nth-child(48n + 26) {
				--column: 37;
			}

			&:nth-child(48n + 27) {
				--column: 11;
			}

			&:nth-child(48n + 28) {
				--column: 38;
			}

			&:nth-child(48n + 29) {
				--column: 10;
			}

			&:nth-child(48n + 30) {
				--column: 39;
			}

			&:nth-child(48n + 31) {
				--column: 9;
			}

			&:nth-child(48n + 32) {
				--column: 40;
			}

			&:nth-child(48n + 33) {
				--column: 8;
			}

			&:nth-child(48n + 34) {
				--column: 41;
			}

			&:nth-child(48n + 35) {
				--column: 7;
			}

			&:nth-child(48n + 36) {
				--column: 42;
			}

			&:nth-child(48n + 37) {
				--column: 6;
			}

			&:nth-child(48n + 38) {
				--column: 43;
			}

			&:nth-child(48n + 39) {
				--column: 5;
			}

			&:nth-child(48n + 40) {
				--column: 44;
			}

			&:nth-child(48n + 41) {
				--column: 4;
			}

			&:nth-child(48n + 42) {
				--column: 45;
			}

			&:nth-child(48n + 43) {
				--column: 3;
			}

			&:nth-child(48n + 44) {
				--column: 46;
			}

			&:nth-child(48n + 45) {
				--column: 2;
			}

			&:nth-child(48n + 46) {
				--column: 47;
			}

			&:nth-child(48n + 47) {
				--column: 1;
			}

			&:nth-child(48n + 48) {
				--column: 48;
			}
		}
	}

	.supporter:hover {
		filter: none;
	}
</style>
