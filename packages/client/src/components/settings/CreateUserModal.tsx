import { useState } from "react";
import { X, Save, Loader2, AlertCircle, Copy, Check } from "lucide-react";
import { ROLE_LIST, ROLE_LABELS } from "../../hooks/useUsers";
import { useTeachersForDropdown } from "../../hooks/useClasses";
import { useStudents } from "../../hooks/useStudents";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
  isSubmitting: boolean;
}

function generateSecurePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$%&!";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const INPUT_CLS =
  "w-full border border-neutral-300/50 rounded-md px-4 py-3 text-sm font-normal text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white";
const LABEL_CLS = "block text-sm font-medium text-neutral-700 mb-2";

export default function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateUserModalProps) {
  const [role, setRole] = useState("PREFET");
  const [nom, setNom] = useState("");
  const [postNom, setPostNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordMode, setPasswordMode] = useState<"auto" | "manual">("auto");
  const [manualPassword, setManualPassword] = useState("");
  const [mustChange, setMustChange] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [teacherId, setTeacherId] = useState("");
  const [parentStudentIds, setParentStudentIds] = useState<string[]>([]);

  const { data: teachers } = useTeachersForDropdown();
  const { students } = useStudents({ status: "ACTIVE", page: 1, limit: 1000 });

  const [genPassword, setGenPassword] = useState(generateSecurePassword());
  const [copied, setCopied] = useState(false);
  const [resultPassword, setResultPassword] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(genPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await onSubmit({
        role,
        nom,
        postNom,
        prenom: prenom || undefined,
        email: email || undefined,
        phone: phone || undefined,
        autoGeneratePassword: passwordMode === "auto",
        password: passwordMode === "manual" ? manualPassword : undefined,
        mustChangePassword: mustChange,
        isActive,
        sendEmailCredentials: sendEmail,
        ...(role === "ENSEIGNANT" && teacherId ? { teacherId } : {}),
        ...(role === "PARENT" && parentStudentIds.length ? { parentStudents: parentStudentIds } : {}),
      });

      if (result?.generatedPassword) {
        setResultPassword(result.generatedPassword);
      } else {
        resetForm();
        onClose();
      }
    } catch (err) {
      // Error is already handled by toast in useUsers hook
    }
  };

  const resetForm = () => {
    setRole("PREFET");
    setNom("");
    setPostNom("");
    setPrenom("");
    setEmail("");
    setPhone("");
    setPasswordMode("auto");
    setManualPassword("");
    setMustChange(true);
    setIsActive(true);
    setSendEmail(false);
    setTeacherId("");
    setParentStudentIds([]);
    setGenPassword(generateSecurePassword());
    setResultPassword(null);
  };

  // Show generated password result
  if (resultPassword) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => {
            resetForm();
            onClose();
          }}
        />
        <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md p-6 space-y-5">
          <h2 className="text-lg font-bold text-neutral-900">
            ✅ Utilisateur créé
          </h2>
          <p className="text-sm text-neutral-700">
            {nom} {postNom} a été créé avec le rôle{" "}
            <strong>{ROLE_LABELS[role]}</strong>.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-xs text-emerald-700 font-medium mb-1">
              Mot de passe généré :
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-lg font-mono font-bold text-emerald-900 select-all">
                {resultPassword}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(resultPassword!);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 text-xs text-amber-800">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            Copiez ce mot de passe maintenant. Il ne sera plus affiché.
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="w-full py-3 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-300/50">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              Créer un utilisateur
            </h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              Accès à la plateforme EduGoma 360
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="px-6 py-5 space-y-5">
            {/* Role */}
            <div>
              <label className={LABEL_CLS}>Rôle *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={INPUT_CLS}
                required
              >
                {ROLE_LIST.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLS}>Nom *</label>
                <input
                  value={nom}
                  onChange={(e) => setNom(e.target.value.toUpperCase())}
                  placeholder="MUKASA"
                  className={INPUT_CLS}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Post-nom *</label>
                <input
                  value={postNom}
                  onChange={(e) => setPostNom(e.target.value.toUpperCase())}
                  placeholder="KALOMBO"
                  className={INPUT_CLS}
                  required
                />
              </div>
            </div>
            <div>
              <label className={LABEL_CLS}>Prénom</label>
              <input
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Jean"
                className={INPUT_CLS}
              />
            </div>

            <hr className="border-neutral-100" />

            {/* Contact */}
            <div>
              <label className={LABEL_CLS}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mukasa.jean@isstumaini.cd"
                className={INPUT_CLS}
              />
              <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> Utilisé pour connexion
              </p>
            </div>
            <div>
              <label className={LABEL_CLS}>Téléphone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+243 810 123 456"
                className={INPUT_CLS}
              />
            </div>

            <hr className="border-neutral-100" />

            {/* Password */}
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-3">
                Mot de passe initial
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={passwordMode === "auto"}
                    onChange={() => setPasswordMode("auto")}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm text-neutral-700">
                    Générer automatiquement
                  </span>
                </label>
                {passwordMode === "auto" && (
                  <div className="ml-7 flex items-center gap-2 bg-neutral-50 rounded-md px-3 py-2">
                    <code className="flex-1 text-sm font-mono font-bold text-neutral-800 select-all">
                      {genPassword}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-1 text-neutral-500 hover:text-primary transition-colors"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                )}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={passwordMode === "manual"}
                    onChange={() => setPasswordMode("manual")}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm text-neutral-700">
                    Définir manuellement
                  </span>
                </label>
                {passwordMode === "manual" && (
                  <input
                    type="text"
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    placeholder="Min. 8 caractères"
                    className={`${INPUT_CLS} ml-7 w-[calc(100%-1.75rem)]`}
                    minLength={8}
                    required
                  />
                )}
              </div>
            </div>

            {role === "ENSEIGNANT" && (
              <>
                <hr className="border-neutral-100" />
                <div>
                  <label className={LABEL_CLS}>Lier au profil enseignant</label>
                  <select
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    className={INPUT_CLS}
                  >
                    <option value="">-- Sélectionner un enseignant --</option>
                    {teachers?.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.nom} {t.postNom} {t.prenom || ""}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {role === "PARENT" && (
              <>
                <hr className="border-neutral-100" />
                <div>
                  <label className={LABEL_CLS}>Élèves rattachés (Tuteur)</label>
                  <select
                    multiple
                    value={parentStudentIds}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions, (o) => o.value);
                      setParentStudentIds(options);
                    }}
                    className={`${INPUT_CLS} h-32`}
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nom} {s.postNom} {s.prenom || ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-neutral-500 mt-1">Maintenez CTRL/CMD pour sélectionner plusieurs élèves.</p>
                </div>
              </>
            )}

            <hr className="border-neutral-100" />

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={mustChange}
                onChange={(e) => setMustChange(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-sm text-neutral-700">
                Forcer changement à la 1ère connexion
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-sm text-neutral-700">
                Compte actif (peut se connecter)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-sm text-neutral-700">
                Envoyer email avec identifiants (si email renseigné)
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-neutral-300/50 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-neutral-700 bg-white border border-neutral-300/50 rounded-md hover:bg-neutral-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !nom || !postNom}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover disabled:opacity-50 transition-all shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
