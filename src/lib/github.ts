import { Octokit } from "@octokit/rest";

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GITHUB_ORG = import.meta.env.VITE_GITHUB_ORG || "sprintforge-org";

export const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

/**
 * Automates the creation of a team repository and adds users as collaborators.
 * (Phase 1: PAT-based Automation)
 */
export const provisionTeamRepo = async (repoName: string, members: string[]) => {
  if (!GITHUB_TOKEN) {
    throw new Error("GitHub Token (PAT) is missing in environment variables.");
  }

  try {
    // 1. Create a Private Repo in the Organization
    const { data: repo } = await octokit.repos.createInOrg({
      org: GITHUB_ORG,
      name: repoName,
      private: true,
      auto_init: true,
      description: `Sprintforge project repository for team workspace`
    });

    // 2. Add members as collaborators
    for (const username of members) {
      await octokit.repos.addCollaborator({
        owner: GITHUB_ORG,
        repo: repoName,
        username,
        permission: "push",
      });
    }

    return repo.html_url;
  } catch (error) {
    console.error("Error provisioning GitHub repo:", error);
    throw error;
  }
};

/**
 * Verifies if a team has actually pushed code.
 * Requires at least 5 commits to be considered a 'Success'.
 */
export const checkRepoCommits = async (repoName: string) => {
  if (!GITHUB_TOKEN) return 0;
  try {
    const { data: commits } = await octokit.repos.listCommits({
      owner: GITHUB_ORG,
      repo: repoName,
      per_page: 10, // We only need to see if they crossed the threshold
    });
    return commits.length;
  } catch (error) {
    console.error("Error checking commits:", error);
    return 0;
  }
};

// Helper to get week number
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function () {
  const firstDayOfYear = new Date(this.getFullYear(), 0, 1);
  const pastDaysOfYear = (this.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};
