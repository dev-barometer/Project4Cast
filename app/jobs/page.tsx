// app/jobs/page.tsx
// Redirect to home page for backwards compatibility

import { redirect } from 'next/navigation';

export default function JobsPageRedirect() {
  redirect('/');
}
