type UserLogged = NonNullable<Window["__APP__"]>["user"];

export const isAdminRole = (user: any): boolean => 
  user?.role === 'Admin';

export const isUserSystem = (user: any): boolean => 
  isAdminRole(user) && user.username === 'SuperAdmin';

export const getUser = (): UserLogged | null => window.__APP__.user; //  ?? null

export const updateUser = <T extends object>(data: Partial<T>) => {
  const user = {
    ...getUser(), 
    ...data 
  };
  // console.log('updateUser user:', user);

  if(isAdminRole(user)){ // user.role === 'Admin'
    user.isAdmin = true;

    if(user.username === 'SuperAdmin'){
      user.isUserSystem = true;
    }
  }

  window.__APP__.user = user;

  // window.__APP__.user = {
  //   ...extendUser, 
  //   isAdmin,
  //   isUserSystem: isAdmin && extendUser.username === 'SuperAdmin'
  // };

  // window.__APP__.user = { ...user, ...data };

  // Hack refetch user, e.g in Header / Nav
  document.querySelectorAll('.btnRefetchUser')
    .forEach((btn: any) => btn?.click());
}

export const clearUser = () => {
  if (window.__APP__) window.__APP__.user = null;
};

const avatarBaseUrl = "/storage/avatars/";

export const getAvatarUrl = (src: string): string | null => {
  if(!src) return null;

  /**
   * Support all absolute URLs
   * (including https, http, blob, data, file, etc)
   */
  if(
    /^[a-z][a-z0-9+.-]*:/i.test(src) || 
    src.startsWith(avatarBaseUrl)
  ){
    return src;
  }

  /**
   * @OR
   */

  // if(
  //   src.startsWith("http") || 
  //   src.startsWith("data:image/") || 
  //   src.startsWith("blob:") || 
  //   src.startsWith(avatarBaseUrl)
  // ){
  //   return src;
  // }

  return avatarBaseUrl + src;
};
