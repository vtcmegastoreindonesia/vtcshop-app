import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://diiwiditvpkxpcoypoo.supabase.co'
const supabaseKey = 'sb_publishable_LgLmxUflGLh1WyW42vxF_A_eMk1AUbF'

export const supabase = createClient(supabaseUrl, supabaseKey)
