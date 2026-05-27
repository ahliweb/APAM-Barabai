import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Search, Radiation, CreditCard, Layers } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function RadiologiScreen() {
  const perPage = 20;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchPage(1, { reset: true, query: '' });
  }, []);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchPage(1, { reset: true, query: search });
    }, 350);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [search]);

  const fetchPage = async (nextPage: number, options: { reset: boolean; query: string }) => {
    const query = (options.query || '').trim();
    if (options.reset) {
      setLoading(true);
      setHasMore(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      const params: any = {
        page: nextPage,
        per_page: perPage,
      };
      if (query) params.s = query;

      const response = await api.master.list('jns_perawatan_radiologi', params);
      const rows = (response.data as any)?.data ?? (response.data as any)?.data?.data ?? [];
      const meta = (response.data as any)?.meta ?? {};
      const total = typeof meta?.total === 'number' ? meta.total : undefined;

      const nextRows = Array.isArray(rows) ? rows : [];
      setData((prev) => {
        const base = options.reset ? [] : (Array.isArray(prev) ? prev : []);
        const merged = [...base, ...nextRows];
        const seen = new Set<string>();
        return merged.filter((item: any) => {
          const key = String(item?.kd_jenis_prw ?? '');
          if (!key) return true;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      });

      setPage(nextPage);
      if (typeof total === 'number') {
        setHasMore(nextPage * perPage < total);
      } else {
        setHasMore(nextRows.length === perPage);
      }
    } catch (error) {
      console.error('Error fetching jns_perawatan_radiologi:', error);
      if (options.reset) {
        setData([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      setFilteredData(data);
      return;
    }

    setFilteredData(
      (Array.isArray(data) ? data : []).filter((item: any) =>
        String(item?.nm_perawatan || '').toLowerCase().includes(keyword) ||
        String(item?.kd_jenis_prw || '').toLowerCase().includes(keyword)
      )
    );
  }, [data, search]);

  const handleSearch = (text: string) => {
    setSearch(text);
  };

  const loadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    fetchPage(page + 1, { reset: false, query: search });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPage(1, { reset: true, query: search });
  };

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Radiation size={20} color="#62B986" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.itemCode}>{item.kd_jenis_prw}</Text>
          <Text style={styles.itemName}>{item.nm_perawatan}</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.cardFooter}>
        <View style={styles.infoCol}>
          <Layers size={14} color="#999" style={styles.miniIcon} />
          <Text style={styles.infoLabel}>{item.nm_kategori || 'Kat. Rad'}</Text>
        </View>
        <View style={styles.priceContainer}>
          <CreditCard size={14} color="#62B986" style={styles.miniIcon} />
          <Text style={styles.priceText}>{formatCurrency(item.total_byrdrpr || 0)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#62B986', '#72C996']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Layanan Radiologi</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari jenis pemeriksaan radiologi..."
            value={search}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#62B986" />
          <Text style={styles.loadingText}>Memuat data layanan...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item: any, index) => item.kd_jenis_prw?.toString() || index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#62B986" />
                <Text style={styles.footerLoaderText}>Memuat data...</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={() => (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Data tidak ditemukan.</Text>
            </View>
          )}
        />
      )}
      <BlurView
        intensity={30}
        tint="light"
        style={styles.bottomBlurOverlay}
        experimentalBlurMethod="dimezisBlurView"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  bottomBlurOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    pointerEvents: 'none',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  searchContainer: {
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  footerLoader: {
    paddingTop: 4,
    paddingBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoaderText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  itemCode: {
    fontSize: 11,
    fontWeight: '600',
    color: '#62B986',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniIcon: {
    marginRight: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
