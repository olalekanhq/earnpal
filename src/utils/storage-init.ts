import { supabase } from "@/integrations/supabase/client";

export async function ensureBucketsExist() {
  const buckets = ['avatars', 'rewards'];
  
  for (const bucket of buckets) {
    const { data, error } = await supabase.storage.getBucket(bucket);
    if (error || !data) {
      console.log(`Bucket ${bucket} does not exist, creating...`);
      // Note: createBucket might fail if not admin, but we'll try
      await supabase.storage.createBucket(bucket, {
        public: true,
      });
    }
  }
}
