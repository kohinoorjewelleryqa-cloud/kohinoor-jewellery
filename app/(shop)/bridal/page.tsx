import { permanentRedirect } from "next/navigation";

// Kept only so old links keep working: this page moved when the store became silver-only.
export default function Moved() {
  permanentRedirect("/jewellery/sets");
}
