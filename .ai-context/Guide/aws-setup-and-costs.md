# AWS Setup & Cost Guide for AutoDev

> Budget: $100 AWS credits | Estimated spend: $30-50

---

## Project Assessment

**Strengths**:
- Problem is real and relatable — every developer has felt the pain of joining a new codebase
- "Learning not Doing" angle is smart — not competing with CodeRabbit/Copilot, own lane
- Bharat angle is genuine — Hindi code explanations is a real need for 4.3M Indian devs
- M1-M3 already done — working foundation, most hackathon teams never get past setup

**Risks**:
- Demo needs to feel polished — focus on 2-3 features working perfectly rather than 7 half-working
- Animated map is the "wow moment" — if that looks good, judges remember you
- $100 AWS credits is enough if careful

---

## AWS Services Required

### 1. Amazon Bedrock (Biggest Cost)

**Models to enable** (in Bedrock console → Model access):

| Model | Use For | Cost (per 1M tokens) |
|---|---|---|
| **Claude 3.5 Sonnet** | Architecture analysis, walkthrough generation, complex Q&A | ~$3 input / ~$15 output |
| **Claude 3 Haiku** | Convention detection, env setup analysis, multi-language translation, jargon decoding | ~$0.25 input / ~$1.25 output |
| **Amazon Titan Embeddings V2** | Semantic search (M5) | ~$0.02 |

**Region**: us-east-1 (Virginia) — best Bedrock model availability

**How to enable**:
1. Go to AWS Console → Amazon Bedrock → Model access
2. Request access to Claude 3.5 Sonnet, Claude 3 Haiku, Titan Embeddings V2
3. Wait for approval (usually instant for these models)

**Estimated cost**: $20-40 for development + testing + demo

---

### 2. DynamoDB (Almost Free)

**Tables needed**:

| Table | Partition Key | Sort Key | Purpose |
|---|---|---|---|
| `autodev-repos` | `repoId` (S) | — | Repo metadata |
| `autodev-analyses` | `repoId` (S) | `analysisId` (S) | Analysis results |
| `autodev-qa-cache` | `repoId` (S) | `questionHash` (S) | Cached Q&A responses (TTL enabled) |
| `autodev-progress` | `userId` (S) | `repoId` (S) | Learning progress tracking |
| `autodev-walkthroughs` | `repoId` (S) | `walkthroughId` (S) | Generated walkthroughs |

**Pricing**: On-demand mode — pay per read/write
**Estimated cost**: ~$1-2

---

### 3. S3 (Almost Free)

**Buckets needed**:

| Bucket | Purpose |
|---|---|
| `autodev-repo-files` | Stored repo contents for analysis |
| `autodev-analysis-results` | JSON analysis outputs, architecture data |

**Estimated cost**: ~$0.50

---

### 4. Lambda + API Gateway

- **Lambda**: Backend runs via `serverless-http` wrapping Express
- **API Gateway**: REST API endpoint for frontend/extension to call

**Estimated cost**: ~$1-2 (free tier covers most of it)

---

### 5. IAM Setup

**Create an IAM user** (or use IAM role for Lambda):

**Required policies**:
- `AmazonBedrockFullAccess`
- `AmazonDynamoDBFullAccess`
- `AmazonS3FullAccess`
- `AWSLambda_FullAccess`
- `AmazonAPIGatewayAdministrator`

**Generate these credentials**:
```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

---

### 6. GitHub App (Free)

**Create at** github.com/settings/apps → New GitHub App

**Settings**:
- Homepage URL: your deployed frontend URL
- Webhook URL: your API Gateway endpoint + `/api/webhooks/github`
- Webhook secret: generate a random string

**Permissions needed**:
- Repository contents: Read
- Pull requests: Read & Write
- Metadata: Read
- Issues: Read

**Subscribe to events**:
- Installation
- Pull request
- Push

**Credentials generated**:
```
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY=<contents of .pem file>
GITHUB_WEBHOOK_SECRET=<your random string>
```

---

## Full .env File Template

```env
# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

# Bedrock Models
BEDROCK_MODEL_SONNET=anthropic.claude-3-5-sonnet-20241022-v2:0
BEDROCK_MODEL_HAIKU=anthropic.claude-3-haiku-20240307-v1:0
BEDROCK_MODEL_EMBEDDINGS=amazon.titan-embed-text-v2:0

# DynamoDB
DYNAMODB_TABLE_REPOS=autodev-repos
DYNAMODB_TABLE_ANALYSES=autodev-analyses
DYNAMODB_TABLE_QA_CACHE=autodev-qa-cache
DYNAMODB_TABLE_PROGRESS=autodev-progress
DYNAMODB_TABLE_WALKTHROUGHS=autodev-walkthroughs

# S3
S3_BUCKET_REPO_FILES=autodev-repo-files
S3_BUCKET_ANALYSIS=autodev-analysis-results

# GitHub App
GITHUB_APP_ID=
GITHUB_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=

# App
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:3000
```

---

## Cost Breakdown Summary

| Service | Estimated Cost | Notes |
|---|---|---|
| Bedrock (Claude Sonnet) | $25-40 | Biggest cost — use Haiku for cheap tasks |
| Bedrock (Titan Embeddings) | $2-3 | Very cheap |
| DynamoDB | $1-2 | On-demand, minimal reads/writes |
| S3 | $0.50 | Small file storage |
| Lambda + API Gateway | $1-2 | Free tier covers most |
| **Total estimated** | **~$30-50** | **$50-70 left as buffer** |

---

## Cost-Saving Tips

1. **Use Haiku (not Sonnet) for cheap tasks**: env setup analysis, convention detection, multi-language translation, jargon decoding
2. **Use Sonnet only for heavy tasks**: architecture analysis, walkthrough generation, complex Q&A
3. **Cache aggressively** in DynamoDB — don't re-analyze the same repo twice
4. **Pre-analyze demo repos** before demo day — don't burn tokens live
5. **Set billing alerts** at $50 and $80 in AWS Billing console → Budgets
6. **Use DynamoDB TTL** on cache table — auto-delete old entries, save storage

---

## Setup Order (Step by Step)

1. **AWS Account** → Enable Bedrock model access (us-east-1)
2. **IAM User** → Create with required policies → Get access keys
3. **DynamoDB** → Create 5 tables (on-demand mode)
4. **S3** → Create 2 buckets
5. **GitHub App** → Create at github.com/settings/apps → Get App ID + private key
6. **Fill .env** → Add all credentials
7. **Test locally** → `pnpm dev` from root → verify backend + frontend connect to AWS
8. **Deploy** → SAM deploy (Lambda + API Gateway)
9. **Update GitHub App** → Point webhook URL to deployed API Gateway
10. **Pre-analyze demo repos** → Save tokens for demo day
