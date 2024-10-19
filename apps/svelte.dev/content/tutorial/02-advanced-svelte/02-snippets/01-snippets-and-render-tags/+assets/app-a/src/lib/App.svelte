<script>
	let emoji = '🙈';
	let description = 'see no evil';
</script>

<table>
	<thead>
		<tr>
			<th>emoji</th>
			<th>description</th>
			<th>unicode escape sequence</th>
			<th>html entity</th>
		</tr>
	</thead>

	<tbody>
		<tr>
			<td>{emoji}</td>
			<td>{description}</td>
			<td>\u{emoji.charCodeAt(0).toString(16)}\u{emoji.charCodeAt(1).toString(16)}</td>
			<td>&amp#{emoji.codePointAt(0)}</td>
		</tr>
	</tbody>
</table>

<style>
	th, td {
		padding: 0.5em;
	}

	td:nth-child(3),
	td:nth-child(4) {
		font-family: monospace;
	}
</style>
