import type { Handle } from '@sveltejs/kit';
import { getMemberFromSession } from '$lib/auth';

const PUBLIC_ROUTES = ['/login', '/auth/verify', '/setup'];

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('session');
	const member = await getMemberFromSession(sessionToken);
	event.locals.member = member;

	const isPublic = PUBLIC_ROUTES.some(r => event.url.pathname.startsWith(r));

	if (!member && !isPublic) {
		return Response.redirect(`${event.url.origin}/login`, 303);
	}

	return resolve(event);
};
