// Identificador del espacio de trabajo que el navegador envía al servidor.
// Con sesión iniciada es el UID de Google. Sin sesión, un identificador anónimo propio de este
// navegador, para no mezclar datos de visitantes en un espacio compartido.
// (La verificación real de identidad en el servidor llega con la tarea de seguridad.)
export function getWorkspaceId(userId?: string | null): string {
  if (userId) return userId;
  try {
    let anon = localStorage.getItem('4haus_anon_workspace_id');
    if (!anon) {
      anon = `anon_${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem('4haus_anon_workspace_id', anon);
    }
    return anon;
  } catch {
    return 'anon_session';
  }
}
