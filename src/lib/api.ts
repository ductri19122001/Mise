export type ApiIssue = {
  id: string;
  severity: 'high' | 'medium' | 'low';
  amount: string;
  title: string;
  detail: string;
  status: 'open' | 'resolved';
};

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function fetchIssues(): Promise<ApiIssue[]> {
  const response = await fetch(`${apiUrl}/api/v1/issues`);
  if (!response.ok) {
    throw new Error(`Mise API returned ${response.status}`);
  }
  return response.json() as Promise<ApiIssue[]>;
}

export async function resolveIssue(issueId: string): Promise<ApiIssue> {
  const response = await fetch(`${apiUrl}/api/v1/issues/${issueId}/resolve`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error(`Mise API returned ${response.status}`);
  }
  return response.json() as Promise<ApiIssue>;
}