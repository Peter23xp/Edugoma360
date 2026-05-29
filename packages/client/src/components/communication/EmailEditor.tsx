import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Mail, Bold, Italic, Underline, List, Link as LinkIcon, Image as ImageIcon, Type, Tag } from 'lucide-react';

interface EmailEditorProps {
  subject: string;
  setSubject: (sub: string) => void;
  htmlContent: string;
  setHtmlContent: (html: string) => void;
}

const availableVariables = [
  { key: '{nom}', label: 'Nom élève' },
  { key: '{prenom}', label: 'Prénom' },
  { key: '{classe}', label: 'Classe' },
  { key: '{montant}', label: 'Montant' },
  { key: '{date}', label: 'Date' },
  { key: '{ecole}', label: 'École' },
];

export function EmailEditor({ subject, setSubject, htmlContent, setHtmlContent }: EmailEditorProps) {
  const insertVariable = (variable: string) => {
    // In a real HTMLEditor, you would insert at caret position.
    // For this mock, we just append or use a generic textarea behavior.
    setHtmlContent(htmlContent + variable);
  };

  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#0D47A1]/5 to-transparent border-b border-gray-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
          <Mail className="h-5 w-5 text-[#0D47A1]" />
          Contenu de l'email
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Objet de l'email :
          </Label>
          <Input 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex: Résultats Trimestre 1 - 2025/2026"
            className="w-full text-sm font-medium"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-sm font-medium text-gray-700">Message :</Label>
          </div>

          <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#0D47A1]/20 focus-within:border-[#0D47A1] transition-all">
            {/* Toolbar (Mock formatting) */}
            <div className="flex items-center gap-1 bg-gray-50 border-b border-gray-200 px-3 py-2 flex-wrap text-gray-600">
              <button title="Gras" className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"><Bold className="w-4 h-4" /></button>
              <button title="Italique" className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"><Italic className="w-4 h-4" /></button>
              <button title="Souligné" className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"><Underline className="w-4 h-4" /></button>
              <div className="w-px h-5 bg-gray-300 mx-1"></div>
              <button title="Liste" className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"><List className="w-4 h-4" /></button>
              <button title="Lien" className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"><LinkIcon className="w-4 h-4" /></button>
              <button title="Image" className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"><ImageIcon className="w-4 h-4" /></button>
              <div className="w-px h-5 bg-gray-300 mx-1"></div>
              <button title="Tirer ligne" className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"><Type className="w-4 h-4" /></button>
            </div>
            
            {/* Real textarea replacing WYSIWYG for simplicity here */}
            <textarea
              className="w-full min-h-[300px] p-4 text-sm resize-none focus:outline-none bg-white font-sans text-gray-800 leading-relaxed"
              placeholder="Rédigez votre email ici..."
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
            />
          </div>
        </div>

        {/* Variables selector */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-[#0D47A1]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D47A1]">
              Insérer une variable :
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableVariables.map(v => (
              <button
                key={v.key}
                onClick={() => insertVariable(v.key)}
                className="
                  px-2 py-1 bg-white border border-blue-200 rounded text-xs font-mono text-gray-600
                  hover:bg-[#0D47A1] hover:text-white hover:border-[#0D47A1] transition-colors
                "
              >
                {v.key} <span className="opacity-50 text-[10px] ml-1">{v.label}</span>
              </button>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
