import User from "@/models/user.model";

export async function generateUniqueUsername(base: string): Promise<string> {
  let username = base.toLowerCase().replace(/[^a-z0-9_]/g, ""); 
  let exists = await User.exists({ username });
  let counter = 1;

  while (exists) {
    const suffix = Math.random().toString(36).substring(2, 5);
    const newUsername = `${username}_${suffix}`;
    exists = await User.exists({ username: newUsername });
    if (!exists) {
      username = newUsername;
      break;
    }
    counter++;
  }

  return username;
}
