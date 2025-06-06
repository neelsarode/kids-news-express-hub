
import React, { useEffect, memo, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import CategoryPageContainer from '@/components/Category/CategoryPageContainer';
import { getCategoryByPath } from '@/utils/navigation/categoryRoutes';
import { logger } from '@/utils/logger/logger';
import { LogSource } from '@/utils/logger/types';

const CategoryPageContent = memo(({ categoryId }: { categoryId: string | undefined }) => {
  useEffect(() => {
    logger.info(LogSource.APP, 'CategoryPageContent mounted with categoryId', {
      categoryId: categoryId || 'none'
    });
  }, [categoryId]);

  return (
    <div className="w-full">
      <CategoryPageContainer 
        category={categoryId} 
        key={`category-${categoryId || 'default'}`}
      />
    </div>
  );
});

CategoryPageContent.displayName = 'CategoryPageContent';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  
  // Extract category from pathname for direct routes (e.g., /headliners -> headliners)
  const pathCategory = location.pathname.startsWith('/') ? location.pathname.slice(1) : location.pathname;
  const categoryRoute = getCategoryByPath(location.pathname);
  
  // Use categoryId from params if available, otherwise use path-based category
  const resolvedCategoryId = categoryId || categoryRoute?.slug || pathCategory;
  const mountCountRef = useRef(0);
  
  useEffect(() => {
    mountCountRef.current += 1;
    
    logger.info(LogSource.APP, 'Category page loaded', {
      categoryId: resolvedCategoryId,
      pathname: location.pathname,
      key: location.key,
      routeInfo: categoryRoute,
      pathCategory,
      mountCount: mountCountRef.current
    });
    
    return () => {
      logger.info(LogSource.APP, 'Category page unmounted', {
        categoryId: resolvedCategoryId,
        pathname: location.pathname
      });
    };
  }, [resolvedCategoryId, location.pathname, location.key, categoryRoute, pathCategory]);

  return (
    <MainLayout fullWidth={true}>
      <CategoryPageContent categoryId={resolvedCategoryId} />
    </MainLayout>
  );
};

export default CategoryPage;
