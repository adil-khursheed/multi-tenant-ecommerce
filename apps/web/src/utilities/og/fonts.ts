import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type OgFont = {
  name: string;
  data: Buffer;
  weight?: 400 | 500 | 600;
  style?: "normal" | "italic";
};

const fontDirectory = join(process.cwd(), "src", "fonts");

const readOgFont = (file: string) => readFile(join(fontDirectory, file));

let fontsPromise: Promise<OgFont[]> | null = null;

export const loadOgFonts = () => {
  fontsPromise ??= Promise.all([
    readOgFont("CormorantGaramond-Regular.woff"),
    readOgFont("CormorantGaramond-Italic.woff"),
    readOgFont("CormorantGaramond-SemiBold.woff"),
    readOgFont("DMSans-Regular.woff"),
    readOgFont("DMSans-Medium.woff"),
    readOgFont("DMMono-Medium.woff"),
  ]).then(
    ([
      cormorantRegular,
      cormorantItalic,
      cormorantSemiBold,
      dmSansRegular,
      dmSansMedium,
      dmMonoMedium,
    ]) => [
      {
        name: "Cormorant Garamond",
        data: cormorantRegular,
        style: "normal",
        weight: 400,
      },
      {
        name: "Cormorant Garamond",
        data: cormorantItalic,
        style: "italic",
        weight: 400,
      },
      {
        name: "Cormorant Garamond",
        data: cormorantSemiBold,
        style: "normal",
        weight: 600,
      },
      { name: "DM Sans", data: dmSansRegular, style: "normal", weight: 400 },
      { name: "DM Sans", data: dmSansMedium, style: "normal", weight: 500 },
      { name: "DM Mono", data: dmMonoMedium, style: "normal", weight: 500 },
    ],
  );

  return fontsPromise;
};
