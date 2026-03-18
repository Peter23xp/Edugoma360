import React, { useMemo } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface ProvinceVilleSelectorProps {
    provinceValue: string;
    villeValue: string;
    onProvinceChange: (province: string) => void;
    onVilleChange: (ville: string) => void;
    errorProvince?: string;
    errorVille?: string;
}

const PROVINCES_RDC = [
    { code: 'KIN', name: 'Kinshasa', villes: ['Kinshasa'] },
    { code: 'KC', name: 'Kongo Central', villes: ['Matadi', 'Boma', 'Mbanza-Ngungu'] },
    { code: 'KWG', name: 'Kwango', villes: ['Kenge', 'Kasongo-Lunda'] },
    { code: 'KWL', name: 'Kwilu', villes: ['Bandundu', 'Kikwit'] },
    { code: 'MN', name: 'Mai-Ndombe', villes: ['Inongo', 'Nioki'] },
    { code: 'KAS', name: 'Kasaï', villes: ['Tshikapa', 'Ilebo'] },
    { code: 'KCA', name: 'Kasaï-Central', villes: ['Kananga', 'Luiza'] },
    { code: 'KOR', name: 'Kasaï-Oriental', villes: ['Mbuji-Mayi', 'Kabinda'] },
    { code: 'LOM', name: 'Lomami', villes: ['Kabinda', 'Kamina'] },
    { code: 'SNK', name: 'Sankuru', villes: ['Lusambo', 'Lodja'] },
    { code: 'MAN', name: 'Maniema', villes: ['Kindu', 'Kasongo', 'Kabambare'] },
    { code: 'SK', name: 'Sud-Kivu', villes: ['Bukavu', 'Uvira', 'Kabare', 'Walungu'] },
    { code: 'NK', name: 'Nord-Kivu', villes: ['Goma', 'Butembo', 'Beni', 'Rutshuru', 'Masisi', 'Walikale'] },
    { code: 'ITU', name: 'Ituri', villes: ['Bunia', 'Mahagi', 'Aru'] },
    { code: 'HU', name: 'Haut-Uélé', villes: ['Isiro', 'Watsa', 'Dungu'] },
    { code: 'TSH', name: 'Tshopo', villes: ['Kisangani', 'Isangi', 'Ubundu'] },
    { code: 'BU', name: 'Bas-Uélé', villes: ['Buta', 'Aketi', 'Bambesa'] },
    { code: 'NU', name: 'Nord-Ubangi', villes: ['Gbadolite', 'Mobayi-Mbongo'] },
    { code: 'MON', name: 'Mongala', villes: ['Lisala', 'Bumba', 'Bongandanga'] },
    { code: 'SU', name: 'Sud-Ubangi', villes: ['Gemena', 'Libenge', 'Kungu'] },
    { code: 'EQ', name: 'Équateur', villes: ['Mbandaka', 'Bikoro', 'Lukolela'] },
    { code: 'TSU', name: 'Tshuapa', villes: ['Boende', 'Ikela', 'Monkoto'] },
    { code: 'TAN', name: 'Tanganyika', villes: ['Kalemie', 'Kongolo', 'Nyunzu'] },
    { code: 'HL', name: 'Haut-Lomami', villes: ['Kamina', 'Bukama', 'Kaniama'] },
    { code: 'LUA', name: 'Lualaba', villes: ['Kolwezi', 'Dilolo', 'Mutshatsha'] },
    { code: 'HK', name: 'Haut-Katanga', villes: ['Lubumbashi', 'Likasi', 'Kambove'] }
];

export default function ProvinceVilleSelector({ 
    provinceValue, 
    villeValue, 
    onProvinceChange, 
    onVilleChange,
    errorProvince,
    errorVille
}: ProvinceVilleSelectorProps) {

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onProvinceChange(e.target.value);
        onVilleChange(""); // Reset ville
    };

    const handleVilleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onVilleChange(e.target.value);
    };

    const selectedProvinceObj = useMemo(() => {
        return PROVINCES_RDC.find(p => p.name === provinceValue);
    }, [provinceValue]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-neutral-900 mb-1">
                    Province <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <select
                        value={provinceValue || ""}
                        onChange={handleProvinceChange}
                        className={cn(
                            "w-full appearance-none h-10 pl-4 pr-10 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20",
                            errorProvince ? "border-red-500 focus:border-red-500" : "border-neutral-300 focus:border-primary"
                        )}
                    >
                        <option value="" disabled>Sélectionner une province</option>
                        {PROVINCES_RDC.sort((a,b) => a.name.localeCompare(b.name)).map(p => (
                            <option key={p.code} value={p.name}>{p.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                </div>
                {errorProvince && <p className="text-xs text-red-500 mt-1">{errorProvince}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-900 mb-1">
                    Ville <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <select
                        value={villeValue || ""}
                        onChange={handleVilleChange}
                        disabled={!provinceValue}
                        className={cn(
                            "w-full appearance-none h-10 pl-4 pr-10 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-neutral-100 disabled:cursor-not-allowed",
                            errorVille ? "border-red-500 focus:border-red-500" : "border-neutral-300 focus:border-primary"
                        )}
                    >
                        <option value="" disabled>Sélectionner une ville</option>
                        {selectedProvinceObj?.villes.sort().map(v => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                </div>
                {errorVille && <p className="text-xs text-red-500 mt-1">{errorVille}</p>}
                {villeValue && provinceValue && (
                    <p className="text-xs text-neutral-500 mt-1 font-medium">
                        <span className="font-bold text-neutral-700">{villeValue}</span>, <span className="text-neutral-500">{provinceValue}</span>
                    </p>
                )}
            </div>
        </div>
    );
}

