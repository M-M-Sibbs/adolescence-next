import { json } from "@/lib/http";
import { CATEGORIES } from "@/lib/lessons";
export async function GET() {
  return json(CATEGORIES);
}
