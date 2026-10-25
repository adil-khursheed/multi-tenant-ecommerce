import { ogColors, ogFonts } from "./theme";

export function HomeOgImage() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: ogColors.parchment,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 32,
          left: 32,
          width: 1136,
          height: 566,
          border: `1px solid ${ogColors.hairline}`,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 88,
          left: 88,
          width: 1024,
          height: 454,
          display: "flex",
          flexDirection: "row",
          gap: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 600,
            height: 454,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 32,
                height: 1,
                backgroundColor: ogColors.copper,
              }}
            />
            <div
              style={{
                fontFamily: ogFonts.sans,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.24em",
                color: ogColors.muted,
                textTransform: "uppercase",
              }}
            >
              Multi-vendor marketplace
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: ogFonts.serif,
                fontStyle: "italic",
                fontSize: 176,
                lineHeight: 0.86,
                letterSpacing: "-0.035em",
                color: ogColors.copper,
              }}
            >
              DTLEA
            </div>
            <div
              style={{
                marginTop: 28,
                width: 64,
                height: 2,
                backgroundColor: ogColors.copper,
              }}
            />
            <div
              style={{
                marginTop: 24,
                display: "flex",
                flexDirection: "column",
                fontFamily: ogFonts.serif,
                fontSize: 38,
                lineHeight: 1.1,
                color: ogColors.ink,
              }}
            >
              <div>Curated sellers.</div>
              <div>Considered pieces.</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: ogFonts.sans,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.2em",
              color: ogColors.muted,
              textTransform: "uppercase",
            }}
          >
            <div>Verified sellers</div>
            <div style={{ color: ogColors.copper }}>·</div>
            <div>One shared cart</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: 384,
            height: 454,
            padding: 36,
            backgroundColor: ogColors.linen,
            border: `1px solid ${ogColors.hairline}`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: ogFonts.serif,
              fontStyle: "italic",
              fontSize: 44,
              lineHeight: 1.08,
              color: ogColors.ink,
            }}
          >
            <div>One marketplace,</div>
            <div>many identities.</div>
          </div>
          <div
            style={{
              marginTop: 22,
              width: 44,
              height: 1,
              backgroundColor: ogColors.copper,
            }}
          />
        </div>
      </div>
    </div>
  );
}
