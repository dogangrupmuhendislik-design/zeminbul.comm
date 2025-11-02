import { Service, WizardStep } from './types';
import { IconForekazik, IconAnkraj, IconJetGrout, IconZeminEtudu, SlopeSupportIcon, IconYeraltiSuyuKontrolu, IconDSM, IconCFAKazik, DrillIcon, HorizontalDrillIcon, SolarDrillIcon, SolarPileIcon, IconMadenDelgi, IconZeminCivisi } from './components/icons';
import * as React from 'react';

// Re-add SERVICES constant as a fallback for the non-existent DB table
export const SERVICES: Service[] = [
    { id: 'c1b9d5a8-2b8c-4b3f-9d3d-4c5e6f7a8b9c', name: 'Forekazık', description: 'Derin temel sistemleri için kullanılan yerinde dökme betonarme kazıklar.', icon_name: 'IconForekazik', imageUrl: 'https://images.pexels.com/photos/157827/construction-crane-building-site-construction-crane-157827.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 'd2c8e6b9-3c9d-4e4f-8b4e-5d6f7b8c9d0e', name: 'Ankraj', description: 'Zemin ve kayaçları sabitlemek, yapıları desteklemek için kullanılır.', icon_name: 'IconAnkraj', imageUrl: 'https://images.pexels.com/photos/1400249/pexels-photo-1400249.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 'e3d7f5c1-4d8e-4f5b-9b6f-6e7b8c9d0e1f', name: 'Jet Grout', description: 'Yüksek basınçlı çimento enjeksiyonu ile zemin iyileştirme yöntemi.', icon_name: 'IconJetGrout', imageUrl: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 'f4e6b4d2-5e9f-4b6a-8a7b-7f8c9d0e1f2a', name: 'Zemin Etüdü', description: 'Yapı öncesi zemin özelliklerini belirlemek için yapılan araştırma.', icon_name: 'IconZeminEtudu', imageUrl: 'https://images.pexels.com/photos/8346033/pexels-photo-8346033.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 'a5f5c3e3-6f0b-4c7a-9a8c-8b9c0d1e2f3a', name: 'Şev Destekleme', description: 'Eğimli arazilerde kayma ve erozyonu önlemek için yapılan çalışmalar.', icon_name: 'SlopeSupportIcon', imageUrl: 'https://images.pexels.com/photos/1484516/pexels-photo-1484516.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 'b6b4a2f4-7b1c-4a8d-8e9a-9c0d1e2f3a4b', name: 'Yeraltı Suyu Kontrolü', description: 'İnşaat sahasındaki yeraltı suyu seviyesini yönetme ve düşürme.', icon_name: 'IconYeraltiSuyuKontrolu', imageUrl: 'https://images.pexels.com/photos/4384679/pexels-photo-4384679.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 'c7c3a1b5-8c2a-4a9e-9f0a-0a1b2c3d4e5f', name: 'DSM', description: 'Derin Zemin Karıştırma (Deep Soil Mixing) ile zemin iyileştirme.', icon_name: 'IconDSM', imageUrl: 'https://images.pexels.com/photos/5929494/pexels-photo-5929494.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 'd8a2b0c6-9a3b-4b0f-8a1b-1a2b3c4d5e6f', name: 'CFA Kazık', description: 'Sürekli burgu (Continuous Flight Auger) ile yapılan bir kazık türü.', icon_name: 'IconCFAKazik', imageUrl: 'https://images.pexels.com/photos/8346033/pexels-photo-8346033.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 'e9a1c9b7-0a4b-4c1d-9e2c-2b3c4d5e6f7a', name: 'Genel Delgi', description: 'Çeşitli amaçlar için zemin ve kaya delgi işleri.', icon_name: 'DrillIcon', imageUrl: 'https://images.pexels.com/photos/1216544/pexels-photo-1216544.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 'f0b0d8a8-1b5c-4d2e-a03d-3c4d5e6f7a8b', name: 'Yatay Delgi', description: 'Boru hatları ve kablolar için yatay yönlü sondaj uygulamaları.', icon_name: 'HorizontalDrillIcon', imageUrl: 'https://images.pexels.com/photos/9644733/pexels-photo-9644733.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 'a1c9d7b9-2c6d-4e3f-b14e-4d5e6f7a8b9c', name: 'GES Delgisi', description: 'Güneş Enerjisi Santralleri için özel zemin delgi işleri.', icon_name: 'SolarDrillIcon', imageUrl: 'https://images.pexels.com/photos/433309/pexels-photo-433309.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 'b2d8e6c0-3d7e-4f4a-8b5e-5e6f7a8b9c0d', name: 'GES Kazığı', description: 'Güneş paneli montajı için zemine çakılan kazık sistemleri.', icon_name: 'SolarPileIcon', imageUrl: 'https://images.pexels.com/photos/433309/pexels-photo-433309.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 'c3e7f5d1-4e8f-4a5b-9c6f-6f7a8b9c0d1e', name: 'Maden Delgisi', description: 'Maden sahalarında yapılan özel sondaj ve delgi işlemleri.', icon_name: 'IconMadenDelgi', imageUrl: 'https://images.pexels.com/photos/6204374/pexels-photo-6204374.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 'd4f6a4e2-5f9a-4a6c-8d7a-7a8b9c0d1e2f', name: 'Zemin Çivisi', description: 'Kazı yüzeylerini ve şevleri desteklemek için kullanılan pasif elemanlar.', icon_name: 'IconZeminCivisi', imageUrl: 'https://images.pexels.com/photos/1400249/pexels-photo-1400249.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
];

export const ICON_MAP: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  'IconForekazik': IconForekazik,
  'IconAnkraj': IconAnkraj,
  'IconJetGrout': IconJetGrout,
  'IconZeminEtudu': IconZeminEtudu,
  'SlopeSupportIcon': SlopeSupportIcon,
  'IconYeraltiSuyuKontrolu': IconYeraltiSuyuKontrolu,
  'IconDSM': IconDSM,
  'IconCFAKazik': IconCFAKazik,
  'DrillIcon': DrillIcon,
  'HorizontalDrillIcon': HorizontalDrillIcon,
  'SolarDrillIcon': SolarDrillIcon,
  'SolarPileIcon': SolarPileIcon,
  'IconMadenDelgi': IconMadenDelgi,
  'IconZeminCivisi': IconZeminCivisi,
};

export const WIZARD_STEPS: Record<string, WizardStep[]> = {
    default: [
        {
            step: 2,
            title: 'Projenin Teknik Detayları',
            subtitle: 'Bu bilgiler, firmaların daha doğru teklif vermesine yardımcı olur.',
            fields: [
                { id: 'quantity', label: 'Toplam Metraj / Adet', type: 'unit-input', units: ['Adet', 'Metre'], placeholder: 'Örn: 120', required: true },
                { id: 'depth', label: 'Her Bir Delginin Derinliği', type: 'unit-input', units: ['m', 'cm'], placeholder: 'Örn: 15', required: true },
                { id: 'diameter', label: 'Delgi Çapı', type: 'unit-input', units: ['cm', 'mm'], placeholder: 'Örn: 80', required: true },
            ]
        },
        {
            step: 3,
            title: 'Teklif Kapsamı Nedir?',
            subtitle: 'Firmaların hangi maliyetler için teklif vermesini istersiniz?',
            fields: [
                { 
                    id: 'scope', 
                    label: 'Teklif Kapsamı', 
                    type: 'scope', 
                    required: true,
                    options: [
                        { id: 'labor_only', title: 'Sadece İşçilik', description: 'Malzemeler işveren tarafından temin edilecek.' },
                        { id: 'all_inclusive', title: 'İşçilik ve Malzeme Dahil', description: 'Tüm maliyetler firma teklifine dahil edilecek.' }
                    ] 
                },
            ]
        },
        {
            step: 4,
            title: 'İlan Başlığı ve Detayları',
            fields: [
                { id: 'title', label: 'İlan Başlığı', type: 'text', placeholder: 'Örn: Avcılar Konut Projesi Forekazık İşi', required: true },
                { id: 'details', label: 'Proje Detayları', type: 'textarea', placeholder: 'Firmaların bilmesi gereken proje özelinde başka bilgiler var mı? Zemin etüdü raporu, saha erişim koşulları gibi...', required: true },
                { id: 'budget', label: 'Proje Bütçeniz (Opsiyonel)', type: 'text', placeholder: 'Örn: 100.000 TL - 150.000 TL' },
                { 
                    id: 'isUrgent', 
                    label: 'Bu ilan acil mi?', 
                    type: 'toggle', 
                    description: 'Pro üyeler ilanlarını "Acil" olarak işaretleyebilir ve daha fazla dikkat çekebilir.', 
                    proOnly: true 
                },
            ]
        },
        {
            step: 5,
            title: 'İşin yapılacağı konum neresi?',
            subtitle: 'Hizmet verenlerin sana ulaşabilmesi için konum bilgisi önemlidir.',
            fields: [
                { id: 'location', label: 'Konum', type: 'location', placeholder: 'Örn: İstanbul, Kadıköy veya tam adres', required: true },
            ]
        }
    ]
};