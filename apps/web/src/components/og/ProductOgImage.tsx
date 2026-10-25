import { ogColors, ogFonts } from "./theme";

export type OgProduct = {
  title: string;
  storeName: string;
  price?: string;
  image?: string;
};

const clamp = (value: string, maxLength: number) => {
  const trimmed = value.trim();

  if (trimmed.length <= maxLength) return trimmed;

  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
};

export function ProductOgImage({ product }: { product: OgProduct | null }) {
  const title = clamp(product?.title || "Shop the collection", 82);
  const storeName = clamp(product?.storeName || "DTlea", 38);
  const initial = title.charAt(0).toUpperCase() || "D";

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
          top: 80,
          left: 80,
          width: 1040,
          height: 470,
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
            height: 470,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 28,
                height: 1,
                backgroundColor: ogColors.copper,
              }}
            />
            <div
              style={{
                fontFamily: ogFonts.sans,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.22em",
                color: ogColors.muted,
                textTransform: "uppercase",
              }}
            >
              {storeName}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              width: 560,
              fontFamily: ogFonts.serif,
              fontSize: 58,
              fontWeight: 400,
              lineHeight: 1.04,
              letterSpacing: "-0.015em",
              color: ogColors.ink,
            }}
          >
            {title}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {product?.price ? (
              <div
                style={{
                  fontFamily: ogFonts.mono,
                  fontSize: 34,
                  fontWeight: 500,
                  lineHeight: 1,
                  color: ogColors.copper,
                }}
              >
                {product.price}
              </div>
            ) : (
              <div
                style={{
                  fontFamily: ogFonts.sans,
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "0.2em",
                  color: ogColors.copper,
                  textTransform: "uppercase",
                }}
              >
                View on DTlea
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontFamily: ogFonts.sans,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.2em",
                color: ogColors.muted,
                textTransform: "uppercase",
              }}
            >
              <div>DTlea</div>
              <div style={{ color: ogColors.copper }}>·</div>
              <div>Multi-vendor marketplace</div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 400,
            height: 470,
            backgroundColor: ogColors.linen,
            border: `1px solid ${ogColors.hairline}`,
            overflow: "hidden",
          }}
        >
          {product?.image ? (
            <img
              alt=""
              height={470}
              src={product.image}
              style={{ width: 400, height: 470, objectFit: "cover" }}
              width={400}
            />
          ) : (
            <div
              style={{
                fontFamily: ogFonts.serif,
                fontStyle: "italic",
                fontSize: 220,
                lineHeight: 1,
                color: ogColors.copper,
              }}
            >
              {initial}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
