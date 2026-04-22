# e131gateway

`e131gateway` is a small Node/Express HTTP service that writes frames to an E1.31 target
(for example an LED matrix controller). It keeps an in-memory frame buffer and continuously
re-sends it at a configured interval.

## What it does

- Exposes HTTP routes to set one pixel, fill, set send delay, draw a full frame, and read back the in-memory frame.
- Sends E1.31 packets to a configurable matrix host.
- Repeats frame transmission on a fixed cadence so lights do not time out.

## Requirements

- Node.js (project is currently Express 4 based)
- Network access to the E1.31 target host

Install dependencies:

```bash
npm install
```

## Run

Default:

```bash
npm start
```

With options:

```bash
node ./bin/www --matrix matrix.local --delay 50 --candles
```

Bottom-left origin mode:

```bash
node ./bin/www --matrix matrix.local --invert-y
```

You can also set the HTTP listen port with `PORT`:

```bash
PORT=3131 node ./bin/www --matrix matrix.local
```

## Command-line options

`bin/www` supports:

- `--matrix <host>`: E1.31 destination host (default: `matrix.local`)
- `--delay <ms>`: frame resend cadence in milliseconds, clamped to `10..5000` (default: `100`)
- `--candles`: enable candle module startup (`runCandles=true`)
- `--invert-y`: invert the logical Y axis so `0,0` is bottom-left and `7,7` is top-right

Notes:

- Unknown flags are ignored.
- `--delay` and runtime `setdelay` both use the same clamp range (`10..5000`).
- Without `--invert-y`, the default logical origin remains top-left.

## HTTP API

Base path for LED operations: `/led`

### `GET /led/set/:x/:y/:color`

Set one pixel.

- `x`: column index (`0..7`)
- `y`: row index (`0..7`)
- `color`: 6-digit hex RGB without `#` (example: `ff0000`)

Example:

```bash
curl "http://localhost:3131/led/set/3/4/ff0000"
```

Response: plain text `0`

### `GET /led/fill/:color`

Fill whole matrix with one color.

- `color`: 6-digit hex RGB without `#`

Example:

```bash
curl "http://localhost:3131/led/fill/0000ff"
```

Response: plain text `0`

### `GET /led/setdelay/:delay`

Set frame resend interval.

- `delay`: integer milliseconds (internally clamped to `10..5000`)

Example:

```bash
curl "http://localhost:3131/led/setdelay/50"
```

Response: plain text `0`

### `POST /led/drawframe`

Draw a full `8x8` frame.

Request body:

```json
{
	"frame": [
		[16711680, 0, 0, 0, 0, 0, 0, 0],
		[0, 16711680, 0, 0, 0, 0, 0, 0],
		[0, 0, 16711680, 0, 0, 0, 0, 0],
		[0, 0, 0, 16711680, 0, 0, 0, 0],
		[0, 0, 0, 0, 16711680, 0, 0, 0],
		[0, 0, 0, 0, 0, 16711680, 0, 0],
		[0, 0, 0, 0, 0, 0, 16711680, 0],
		[0, 0, 0, 0, 0, 0, 0, 16711680]
	]
}
```

Example:

```bash
curl -X POST "http://localhost:3131/led/drawframe" \
	-H "Content-Type: application/json" \
	-d '{"frame":[[16711680,0,0,0,0,0,0,0],[0,16711680,0,0,0,0,0,0],[0,0,16711680,0,0,0,0,0],[0,0,0,16711680,0,0,0,0],[0,0,0,0,16711680,0,0,0],[0,0,0,0,0,16711680,0,0],[0,0,0,0,0,0,16711680,0],[0,0,0,0,0,0,0,16711680]]}'
```

Response: plain text `0`

### `GET /led/getframe`

Returns current in-memory frame buffer as JSON.

Example:

```bash
curl "http://localhost:3131/led/getframe"
```

Response shape:

```json
{
	"frame": [[0, 0, 0, 0, 0, 0, 0, 0], "..."]
}
```

## Coordinate system and color format

- Default coordinates are `x,y` with origin at top-left (`0,0`), `x` increasing to the right, `y` increasing downward.
- With `--invert-y`, the logical origin becomes bottom-left (`0,0`), with `y` increasing upward.
- `set` and `fill` routes expect hex color path params in `rrggbb` format.
- `drawframe` should provide 24-bit integer cell values (`0..16777215`).
- `getframe` returns the frame in the same logical coordinate mode selected at startup.

## Notes and limitations

- This is a pragmatic demo gateway and still has hard-coded assumptions (matrix size is `8x8`).
- There is minimal input validation on routes; invalid values may produce unexpected output.
