export function convertToRawGithubUrl(repoUrl) {
  const match = repoUrl.match(
    /github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/,
  );
  if (!match)
    throw new Error(
      "GitHub URL tidak valid. Format harus seperti: https://github.com/user/repo/blob/branch/file",
    );

  const [, user, repo, branch, filePath] = match;
  return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filePath}`;
}

export async function fetchGithubJson(repoUrl) {
  try {
    const rawUrl = convertToRawGithubUrl(repoUrl);
    const response = await fetch(rawUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export default {
  convertToRawGithubUrl,
  fetchGithubJson,
};
