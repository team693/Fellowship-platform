-- ============================================================================
-- Heal Digital Fellowships — Seat-code redemption
-- Migration 0005: atomic, race-safe redemption as a SECURITY DEFINER RPC.
--
-- Why an RPC instead of client-side writes?
--   * Redemption touches three rows (code, enrollment, partner seat count) and
--     must be all-or-nothing. A single function call runs in one transaction.
--   * Row locks (FOR UPDATE) prevent two users racing to redeem the same code
--     or overrunning a partner's seat allowance.
--   * enrollment_codes has NO client-side write policy, so this is the ONLY
--     way a student can redeem — they can never flip a code's status directly.
--   * SECURITY DEFINER lets it write those rows while still reading the real
--     caller via auth.uid() (taken from the request JWT, not a parameter).
-- ============================================================================

create or replace function public.redeem_enrollment_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user     uuid := auth.uid();
  v_code     public.enrollment_codes%rowtype;
  v_partner  public.partners%rowtype;
  v_existing uuid;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  -- Normalise and lock the code row.
  select * into v_code
  from public.enrollment_codes
  where upper(code) = upper(btrim(p_code))
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;

  if v_code.status = 'revoked' then
    return jsonb_build_object('ok', false, 'error', 'code_revoked');
  end if;

  if v_code.status = 'redeemed' then
    if v_code.redeemed_by = v_user then
      -- Idempotent: this user already redeemed this exact code.
      return jsonb_build_object('ok', true, 'fellowship_id', v_code.fellowship_id,
                               'already', true);
    end if;
    return jsonb_build_object('ok', false, 'error', 'code_used');
  end if;

  -- Already enrolled in this fellowship (via another code)?
  select id into v_existing
  from public.enrollments
  where user_id = v_user and fellowship_id = v_code.fellowship_id;

  if v_existing is not null then
    return jsonb_build_object('ok', false, 'error', 'already_enrolled',
                             'fellowship_id', v_code.fellowship_id);
  end if;

  -- Lock the partner row and enforce the seat allowance.
  select * into v_partner
  from public.partners
  where id = v_code.partner_id
  for update;

  if v_partner.seats_used >= v_partner.seats_purchased then
    return jsonb_build_object('ok', false, 'error', 'no_seats');
  end if;

  update public.enrollment_codes
     set status = 'redeemed', redeemed_by = v_user, redeemed_at = now()
   where id = v_code.id;

  insert into public.enrollments (user_id, fellowship_id, enrollment_code_id)
  values (v_user, v_code.fellowship_id, v_code.id);

  update public.partners
     set seats_used = seats_used + 1
   where id = v_partner.id;

  return jsonb_build_object('ok', true, 'fellowship_id', v_code.fellowship_id);
end;
$$;

revoke all on function public.redeem_enrollment_code(text) from public, anon;
grant execute on function public.redeem_enrollment_code(text) to authenticated;
