import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { Octokit } from '@octokit/rest';

const app = new Hono();

app.use('*', logger())

app.all('/', (c) => {
  c.status(200);
  return c.json({ status: "ok" });
});

app.post('/deploy', async (c) => {
  const requiredEnvs = [
    "GITHUB_TOKEN",
    "GITHUB_OWNER",
    "GITHUB_REPOSITORY",
    "GITHUB_WORKFLOW_ID",
    "GITHUB_REF"
  ]

  for (const env of requiredEnvs) {
    if (!c.env[env]) {
      return c.json({ error: `Missing environment variable: ${env}` });
    }
  }

  const github = new Octokit({ auth: c.env.GITHUB_TOKEN });
  const dispatch = await github.actions.createWorkflowDispatch({
    "owner": c.env.GITHUB_OWNER,
    "repo": c.env.GITHUB_REPOSITORY,
    "workflow_id": c.env.GITHUB_WORKFLOW_ID,
    "ref": c.env.GITHUB_REF,
  });

  if (dispatch.status === 204) {
    console.log("SUCCESS", dispatch.data)
  } else {
    console.log("ERROR", dispatch);
    c.status(500);
    return c.json({ error: "Error dispatching workflow" });
  }

  c.status(200);
  return c.json({ status: "ok" });
});

export default app
