import { artSvg } from "@/lib/art";

export default function JewelArt({ type, metal, stone, v = 0 }: { type: string; metal: string; stone: string; v?: number }) {
  return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: artSvg(type, metal, stone, v) }} />;
}
