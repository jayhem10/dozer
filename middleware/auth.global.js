export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  if (to.path.startsWith("/admin") && !user.value) {
    if (import.meta.client) {
      window.location.href = `/login?redirect=${to.fullPath}`;
      return;
    }
    return navigateTo(`/login?redirect=${to.fullPath}`);
  }
});
