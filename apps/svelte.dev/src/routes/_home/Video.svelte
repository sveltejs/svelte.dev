<script lang="ts">
	import volume_off from 'icons/volume-off';
	import volume_high from 'icons/volume-high';
	import cc_on from 'icons/cc-on';
	import cc_off from 'icons/cc-off';
	import play from 'icons/play';
	import pause from 'icons/pause';
	import vtt from './subtitles.vtt';
	import { onMount } from 'svelte';

	let video: HTMLVideoElement;

	let paused = $state(false);
	let muted = $state(true);
	let captioned = $state(true);
	let has_used_controls = $state(false);

	$effect(() => {
		video.textTracks[0].mode = captioned ? 'showing' : 'hidden';
	});

	let d = $state(0);
	let t = $state(0);

	onMount(() => {
		// I think this binding is broken in SSR because the video already
		// has a duration by the time hydration occurs. TODO investigate
		d = video.duration;
		paused = video.paused;

		if (matchMedia('(prefers-reduced-motion)').matches) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						video.play();
						observer.disconnect();
					}
				}
			},
			{
				threshold: 1
			}
		);

		observer.observe(video);

		return () => {
			observer.disconnect();
		};
	});

	function handle_cues(node: HTMLTrackElement) {
		const cues = node.track.cues;
		if (node.track.cues) {
			set_cue_positions(cues!);
		} else {
			node.addEventListener('load', handle_load, { once: true });
		}

		return {
			destroy: () => {
				node.removeEventListener('load', handle_load);
			}
		};

		function handle_load(e: Event) {
			const track_el = e.target as HTMLTrackElement;
			set_cue_positions(track_el.track.cues!);
		}

		function set_cue_positions(cues: TextTrackCueList) {
			for (let i = 0; i < cues.length; i++) {
				// https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API#cue_settings
				// @ts-expect-error types not up to date
				cues[i].line = -2; // second line from the bottom
				// @ts-expect-error types not up to date
				cues[i].size = 80; // width is 80% of the available space
			}
		}
	}
</script>

<div class="video-player">
	<video
		src="https://sveltejs.github.io/assets/svelte-origins-preview.mp4"
		loop
		playsinline
		bind:this={video}
		bind:muted
		bind:paused
		bind:currentTime={t}
		bind:duration={d}
		onclick={() => {
			if (video.paused) {
				video.play();

				if (!has_used_controls) {
					muted = false;
				}
			} else {
				video.pause();
			}
		}}
	>
		<track kind="captions" srclang="en" src={vtt} default use:handle_cues />
	</video>

	{#if d}
		<div class="progress-bar" style={`width: ${(t / d) * 100}%`}></div>
	{/if}

	<div class="top-controls">
		<label class="captions" class:unused={!has_used_controls}>
			<input
				class="visually-hidden"
				type="checkbox"
				bind:checked={captioned}
				onchange={() => (has_used_controls = true)}
			/>

			<img style:display={captioned ? 'block' : 'none'} src={cc_on} alt="hide subtitles" />
			<img style:display={captioned ? 'none' : 'block'} src={cc_off} alt="show subtitles" />
		</label>

		<label class="mute" class:unused={!has_used_controls}>
			<input
				class="visually-hidden"
				type="checkbox"
				bind:checked={muted}
				onchange={() => (has_used_controls = true)}
			/>

			<img style:display={muted ? 'block' : 'none'} src={volume_off} alt="unmute" />
			<img style:display={muted ? 'none' : 'block'} src={volume_high} alt="mute" />
		</label>
	</div>

	<label class="play-pause">
		<input
			class="visually-hidden"
			type="checkbox"
			bind:checked={paused}
			onchange={() => {
				if (!has_used_controls) {
					muted = false;
				}
			}}
		/>

		<img style:display={paused ? 'block' : 'none'} src={play} alt="play" />
		<img style:display={paused ? 'none' : 'block'} src={pause} alt="pause" />
	</label>
</div>

<style>
	.video-player {
		position: relative;
		margin: 1em 0;
		border-radius: var(--sk-border-radius);
		filter: drop-shadow(0.5rem 0.5rem 1rem rgba(0, 0, 0, 0.2));
		overflow: hidden;
	}

	video {
		width: 100%;
		display: block;
		--control-filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.3));
	}

	video:focus {
		outline: 1px solid var(--sk-fg-accent);
	}

	video::cue {
		font: var(--sk-font-ui-small);
	}

	@media (min-width: 600px) {
		video::cue {
			font: var(--sk-font-ui-medium);
		}
	}

	.progress-bar {
		position: absolute;
		left: 0;
		bottom: 0;
		height: 0.5rem;
		background: var(--sk-fg-accent);
		transition: height 0.2s;
	}

	label {
		opacity: 0.2;
		transition: opacity 0.2s;
		border-radius: var(--sk-border-radius);
	}

	.top-controls {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.play-pause {
		left: 1rem;
		bottom: 2rem;
		position: absolute;
	}

	.captions {
		line-height: 1;
		color: white;
		font: var(--sk-font-ui-medium);
		filter: var(--control-filter);
	}

	label.unused {
		opacity: 0.8;
	}

	label img {
		width: 3rem;
		height: 3rem;
		filter: var(--control-filter);
	}

	/* TODO re-enable when we get drag-to-seek */
	/* .video-player:hover .progress-bar {
		height: 1rem;
		border-radius: 0 var(--sk-border-radius) var(--sk-border-radius) var(--sk-border-radius);
	} */

	.video-player:hover label,
	.video-player:focus-within label {
		opacity: 1;
	}

	.video-player input:focus-visible ~ img {
		outline: 2px solid var(--sk-fg-accent);
		outline-offset: 2px;
		border-radius: var(--sk-border-radius);
	}
</style>
