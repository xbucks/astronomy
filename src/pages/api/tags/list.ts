import { getAllTags } from "../../../helper/tags";
import { rdata } from "../../../helper/res";

export async function get() {
	return rdata(getAllTags(), 200);
}
