// Script de test pour diagnostiquer l'endpoint /api/payments
const axios = require('axios');

async function testPaymentsEndpoint() {
    try {
        console.log('🔍 Test de l\'endpoint /api/payments...\n');

        // 1. Test sans authentification (devrait échouer avec 401)
        console.log('1️⃣ Test sans authentification:');
        try {
            await axios.get('http://localhost:3000/api/payments');
            console.log('   ❌ ERREUR: Devrait retourner 401\n');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('   ✅ 401 Unauthorized (attendu)\n');
            } else {
                console.log(`   ⚠️  Status inattendu: ${error.response?.status}\n`);
            }
        }

        // 2. Login pour obtenir un token
        console.log('2️⃣ Tentative de login:');
        let token;
        try {
            const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
                identifier: 'admin@edugoma360.cd',
                password: 'Admin@2025',
                rememberMe: false
            });
            token = loginRes.data.data.token;
            console.log('   ✅ Login réussi');
            console.log(`   Token: ${token.substring(0, 20)}...\n`);
        } catch (error) {
            console.log('   ❌ Échec du login:', error.response?.data || error.message);
            console.log('   💡 Vérifiez les identifiants dans .env.example\n');
            return;
        }

        // 3. Test avec authentification
        console.log('3️⃣ Test avec authentification:');
        try {
            const paymentsRes = await axios.get('http://localhost:3000/api/payments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    page: 1,
                    limit: 10
                }
            });

            console.log('   ✅ Requête réussie!');
            console.log('   📊 Structure de la réponse:');
            console.log(JSON.stringify(paymentsRes.data, null, 2));
            console.log('\n   📈 Statistiques:');
            console.log(`   - Total paiements: ${paymentsRes.data.total || 0}`);
            console.log(`   - Nombre retourné: ${paymentsRes.data.data?.length || 0}`);
            console.log(`   - Stats présentes: ${paymentsRes.data.stats ? 'Oui' : 'Non'}`);
            
            if (paymentsRes.data.stats) {
                console.log(`   - Aujourd'hui: ${paymentsRes.data.stats.todayTotal || 0} FC`);
                console.log(`   - Cette semaine: ${paymentsRes.data.stats.weekTotal || 0} FC`);
                console.log(`   - Ce mois: ${paymentsRes.data.stats.monthTotal || 0} FC`);
            }
        } catch (error) {
            console.log('   ❌ Erreur lors de la requête:');
            console.log('   Status:', error.response?.status);
            console.log('   Message:', error.response?.data?.error || error.message);
            console.log('   Détails:', JSON.stringify(error.response?.data, null, 2));
        }

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

testPaymentsEndpoint();
