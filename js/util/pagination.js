export function createPagination({
    pageSize = 10,
    fetchData,
    renderItems,
    emptyState,
}) {

    let page = 1;
    let loading = false;
    let hasMore = true;

    async function load(reset = false) {

        if (loading || (!hasMore && !reset))
            return;

        loading = true;

        if (reset) {
            page = 1;
            hasMore = true;
        }

        try {

            const data = await fetchData(page, pageSize);

            const items = Array.isArray(data)
                ? data
                : data.items || [];

            if (reset)
                emptyState.clear?.();

            if (!items.length) {
                emptyState.show?.();
                hasMore = false;
                return;
            }

            emptyState.hide?.();

            renderItems(items);

            if (items.length < pageSize)
                hasMore = false;
            else
                page++;

        }
        finally {
            loading = false;
        }
    }

    function attachInfiniteScroll() {

        window.addEventListener('scroll', () => {

            if (
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight - 300
            ) {
                load();
            }

        });

    }

    return {
        load,
        attachInfiniteScroll
    };

}