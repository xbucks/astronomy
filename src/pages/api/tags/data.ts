import { getTagData } from "../../../helper/tags";
import { rdata } from "../../../helper/res";

export async function get() {
	return rdata(getTagData(), 200);
}
