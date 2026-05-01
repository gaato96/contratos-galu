-- SCHEMA FOR GALU LEGAL-TECH (LEY 25.506 COMPLIANCE)

-- 1. CONTRACTS (Entidad Principal)
CREATE TABLE public.contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    current_status TEXT NOT NULL CHECK (current_status IN ('DRAFT', 'SENT', 'VIEWED', 'PARTIALLY_SIGNED', 'COMPLETED', 'EXPIRED')),
    active_version_id UUID, -- FK agregada después para evitar dependencia circular
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CONTRACT VERSIONS (Inmutables)
CREATE TABLE public.contract_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content JSONB NOT NULL, -- { sections: [{ id, title, body }], pricing: [], terms: [] }
    total_amount DECIMAL(12, 2) NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('ARS', 'USD')),
    expiry_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Agregar la FK a contracts
ALTER TABLE public.contracts
ADD CONSTRAINT fk_active_version
FOREIGN KEY (active_version_id) REFERENCES public.contract_versions(id) ON DELETE SET NULL;

-- 3. AUDIT LOGS (Trazabilidad Legal)
CREATE TABLE public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    version_id UUID REFERENCES public.contract_versions(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('CREATED', 'SENT', 'VIEWED', 'SECTION_ACCEPTED', 'COMPLETED', 'VERSION_INVALIDATED', 'REMINDER_SENT', 'OTP_SENT', 'OTP_VERIFIED')),
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB, -- Ej: { section_id: '123' } o { otp_hashed: '...' }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SIGNATURES (Registro de Firmas)
CREATE TABLE public.signatures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    version_id UUID NOT NULL REFERENCES public.contract_versions(id) ON DELETE RESTRICT,
    base64_image TEXT NOT NULL, -- O ruta de storage si es muy grande
    document_hash TEXT NOT NULL, -- SHA-256 del content + terms al momento de firmar
    user_identifier TEXT NOT NULL, -- Email que validó el OTP
    ip_address TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. OTP SESSIONS (Temporal para validación de email)
CREATE TABLE public.otp_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    hashed_otp TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SEGURIDAD: Habilitar Row Level Security (RLS)
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_sessions ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS (Permitir lectura y escritura general asumiendo un backend seguro por ahora)
-- En producción, se deben ajustar para que el cliente solo pueda leer su contrato y version
CREATE POLICY "Enable all access for now" ON public.contracts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for now" ON public.contract_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for now" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for now" ON public.signatures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for now" ON public.otp_sessions FOR ALL USING (true) WITH CHECK (true);

-- REALTIME: Habilitar replicación para el Dashboard
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.contracts;
alter publication supabase_realtime add table public.audit_logs;
