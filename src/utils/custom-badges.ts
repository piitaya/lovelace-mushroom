import { repository } from "../../package.json";

interface RegisterBadgeParams {
  type: string;
  name: string;
  description: string;
}
export function registerCustomBadge(params: RegisterBadgeParams) {
  const windowWithBadges = window as unknown as Window & {
    customBadges: unknown[];
  };
  windowWithBadges.customBadges = windowWithBadges.customBadges || [];

  const badgePage = params.type.replace("-badge", "").replace("mushroom-", "");
  windowWithBadges.customBadges.push({
    ...params,
    preview: true,
    documentationURL: `${repository.url}/blob/main/docs/badges/${badgePage}.md`,
  });
}
