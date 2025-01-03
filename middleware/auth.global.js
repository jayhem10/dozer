export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser();

  if (!user.value && process.client) {
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (user.value !== undefined) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  }

  if (to.path.startsWith("/admin") && !user.value) {
    const redirectUrl = `/login?redirect=${encodeURIComponent(to.fullPath)}`;
    if (process.server) {
      return navigateTo(redirectUrl);
    }
    if (process.client) {
      window.location.href = redirectUrl;
    }
  }
});
