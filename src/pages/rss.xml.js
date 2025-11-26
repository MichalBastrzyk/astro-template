import rss from "@astrojs/rss";
import { SITE_DATA } from "@/config";

export function GET(context) {
	return rss({
		title: SITE_DATA.title,
		description: SITE_DATA.description,
		site: context.site,
		items: [],
	});
}
