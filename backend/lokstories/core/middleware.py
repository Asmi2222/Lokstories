def cache_control_middleware(get_response):
    def middleware(request):
        response = get_response(request)
        # Add Cache-Control headers to prevent caching
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response
    return middleware