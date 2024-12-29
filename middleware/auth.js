export default defineNuxtRouteMiddleware((to, _from) => {
  const session = useSupabaseSession();

  if (!session.value && to.path === "/admin") {
    return navigateTo("/login");
  }
});
