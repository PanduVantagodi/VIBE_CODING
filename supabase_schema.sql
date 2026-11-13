-- ==============================================================================
-- ReportSaathi Minimal Schema with Row Level Security (RLS)
-- ==============================================================================

-- 1. PROFILES TABLE (Linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 2. REPORT HISTORY TABLE
-- Privacy Note: Stores ONLY educational structured summary metadata.
-- Raw uploaded files (PDFs/Images) and raw OCR text are NEVER stored by default.
CREATE TABLE IF NOT EXISTS public.report_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_title TEXT NOT NULL,
    filename TEXT NOT NULL,
    overall_summary TEXT NOT NULL,
    clarity_assessment TEXT DEFAULT 'Clear',
    biomarkers_count INT DEFAULT 0,
    sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    key_findings JSONB NOT NULL DEFAULT '[]'::jsonb,
    questions_for_doctor JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for report_history
ALTER TABLE public.report_history ENABLE ROW LEVEL SECURITY;

-- RLS: A signed-in user can only SELECT their own reports
CREATE POLICY "Users can view own report history"
    ON public.report_history FOR SELECT
    USING (auth.uid() = user_id);

-- RLS: A signed-in user can only INSERT their own reports
CREATE POLICY "Users can insert own report history"
    ON public.report_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS: A signed-in user can only DELETE their own reports
CREATE POLICY "Users can delete own report history"
    ON public.report_history FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Automatic Profile Creation Trigger on Sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
