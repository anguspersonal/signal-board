import { createClient } from './supabase'
import { StartupAccess, StartupAccessRole } from '@/types/startup'
import { logger } from './logger'

/**
 * Grant access to a startup for a specific user
 */
export async function grantStartupAccess(
  startupId: string,
  userId: string,
  role: StartupAccessRole,
  grantedBy: string
): Promise<boolean> {
  logger.debug('Granting startup access', { startupId, userId, role, grantedBy })
  const supabase = await createClient()

  // First, check if the user granting access owns the startup
  const { data: startup, error: startupError } = await supabase
    .from('startups')
    .select('user_id')
    .eq('id', startupId)
    .single()

  if (startupError || !startup) {
    logger.error('Error fetching startup for access grant', { startupId, error: startupError })
    return false
  }

  if (startup.user_id !== grantedBy) {
    logger.error('User does not own startup for access grant', { startupId, grantedBy, owner: startup.user_id })
    return false
  }

  // Insert or update the access record
  const { error } = await supabase
    .from('startup_access')
    .upsert({
      startup_id: startupId,
      user_id: userId,
      role: role
    })

  if (error) {
    logger.error('Error granting startup access', { startupId, userId, role, error })
    return false
  }

  logger.debug('Successfully granted startup access', { startupId, userId, role })
  return true
}

/**
 * Revoke access to a startup for a specific user
 */
export async function revokeStartupAccess(
  startupId: string,
  userId: string,
  revokedBy: string
): Promise<boolean> {
  logger.debug('Revoking startup access', { startupId, userId, revokedBy })
  const supabase = await createClient()

  // First, check if the user revoking access owns the startup
  const { data: startup, error: startupError } = await supabase
    .from('startups')
    .select('user_id')
    .eq('id', startupId)
    .single()

  if (startupError || !startup) {
    logger.error('Error fetching startup for access revocation', { startupId, error: startupError })
    return false
  }

  if (startup.user_id !== revokedBy) {
    logger.error('User does not own startup for access revocation', { startupId, revokedBy, owner: startup.user_id })
    return false
  }

  // Delete the access record
  const { error } = await supabase
    .from('startup_access')
    .delete()
    .eq('startup_id', startupId)
    .eq('user_id', userId)

  if (error) {
    logger.error('Error revoking startup access', { startupId, userId, error })
    return false
  }

  logger.debug('Successfully revoked startup access', { startupId, userId })
  return true
}

/**
 * Get all users who have access to a specific startup
 */
export async function getStartupAccessUsers(startupId: string, requestedBy: string): Promise<StartupAccess[]> {
  logger.debug('Getting startup access users', { startupId, requestedBy })
  const supabase = await createClient()

  // First, check if the user requesting has permission to view access
  const { data: startup, error: startupError } = await supabase
    .from('startups')
    .select('user_id')
    .eq('id', startupId)
    .single()

  if (startupError || !startup) {
    logger.error('Error fetching startup for access list', { startupId, error: startupError })
    return []
  }

  if (startup.user_id !== requestedBy) {
    logger.error('User does not own startup for access list', { startupId, requestedBy, owner: startup.user_id })
    return []
  }

  // Get all access records for this startup
  const { data, error } = await supabase
    .from('startup_access')
    .select('*')
    .eq('startup_id', startupId)

  if (error) {
    logger.error('Error fetching startup access users', { startupId, error })
    return []
  }

  logger.debug('Found startup access users', { startupId, count: data?.length || 0 })
  return data || []
}

/**
 * Get all startups that a user has access to (including owned startups)
 */
export async function getUserAccessibleStartups(userId: string): Promise<string[]> {
  logger.debug('Getting user accessible startups', { userId })
  const supabase = await createClient()

  // Get startups owned by the user
  const { data: ownedStartups, error: ownedError } = await supabase
    .from('startups')
    .select('id')
    .eq('user_id', userId)

  if (ownedError) {
    logger.error('Error fetching owned startups', { userId, error: ownedError })
    return []
  }

  // Get startups the user has access to
  const { data: accessStartups, error: accessError } = await supabase
    .from('startup_access')
    .select('startup_id')
    .eq('user_id', userId)

  if (accessError) {
    logger.error('Error fetching access startups', { userId, error: accessError })
    return []
  }

  const ownedIds = ownedStartups?.map(s => s.id) || []
  const accessIds = accessStartups?.map(a => a.startup_id) || []
  
  // Combine and deduplicate
  const allAccessible = [...new Set([...ownedIds, ...accessIds])]

  logger.debug('Found user accessible startups', { userId, count: allAccessible.length })
  return allAccessible
}

/**
 * Check if a user has access to a specific startup
 */
export async function checkUserStartupAccess(
  startupId: string,
  userId: string
): Promise<{ hasAccess: boolean; role?: StartupAccessRole }> {
  logger.debug('Checking user startup access', { startupId, userId })
  const supabase = await createClient()

  // First check if user owns the startup
  const { data: ownedStartup, error: ownedError } = await supabase
    .from('startups')
    .select('user_id')
    .eq('id', startupId)
    .eq('user_id', userId)
    .single()

  if (!ownedError && ownedStartup) {
    logger.debug('User owns startup', { startupId, userId })
    return { hasAccess: true, role: 'editor' }
  }

  // Check if user has explicit access
  const { data: access, error: accessError } = await supabase
    .from('startup_access')
    .select('role')
    .eq('startup_id', startupId)
    .eq('user_id', userId)
    .single()

  if (accessError || !access) {
    logger.debug('User has no access to startup', { startupId, userId })
    return { hasAccess: false }
  }

  logger.debug('User has access to startup', { startupId, userId, role: access.role })
  return { hasAccess: true, role: access.role }
}

/**
 * Update the role for a user's access to a startup
 */
export async function updateStartupAccessRole(
  startupId: string,
  userId: string,
  newRole: StartupAccessRole,
  updatedBy: string
): Promise<boolean> {
  logger.debug('Updating startup access role', { startupId, userId, newRole, updatedBy })
  const supabase = await createClient()

  // First, check if the user updating has permission
  const { data: startup, error: startupError } = await supabase
    .from('startups')
    .select('user_id')
    .eq('id', startupId)
    .single()

  if (startupError || !startup) {
    logger.error('Error fetching startup for role update', { startupId, error: startupError })
    return false
  }

  if (startup.user_id !== updatedBy) {
    logger.error('User does not own startup for role update', { startupId, updatedBy, owner: startup.user_id })
    return false
  }

  // Update the access record
  const { error } = await supabase
    .from('startup_access')
    .update({ role: newRole })
    .eq('startup_id', startupId)
    .eq('user_id', userId)

  if (error) {
    logger.error('Error updating startup access role', { startupId, userId, newRole, error })
    return false
  }

  logger.debug('Successfully updated startup access role', { startupId, userId, newRole })
  return true
} 