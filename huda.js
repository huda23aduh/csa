
const appBaseUrl = 'http://staging.twixo.io',
  appAPIVersion = 'v1',
  appUrl = appBaseUrl + '/api/' + appAPIVersion;

console.log("popopopo")

if (!shopifyStoreDomain || shopifyStoreDomain === null) throw new Error('Missing store domain');

if (!shopifyStoreState || shopifyStoreState === null) throw new Error('Missing store state');
let incrementQuantity, decrementQuantity;
async function TwixoInit() {
  function setCookie(name, value, daysToExpire) {
    const expires = new Date();
    expires.setTime(expires.getTime() + daysToExpire * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;

    // Check if the cookie was successfully set
    const allCookies = document.cookie;
    const cookieExists = allCookies.includes(`${name}=${value}`);

    if (cookieExists) {
      //console.log(`Cookie '${name}' was successfully set.`);
    } else {
      console.error(`Failed to set cookie '${name}'.`);
    }
  }

  // Function to get a cookie by name
  function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return cookieValue;
      }
    }
    return null;
  }

  // Function to delete a cookie by name
  function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }

  function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getLocalStorage(key) {
    const storedValue = localStorage.getItem(key);
    if (storedValue !== null && storedValue !== undefined) {
      try {
        return JSON.parse(storedValue);
      } catch (error) {
        console.error(`Error parsing JSON for key '${key}':`, error);
      }
    }
    return null;
  }

  async function validateCreds() {
    try {
      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

      var urlencoded = new URLSearchParams();
      urlencoded.append('host', shopifyStoreDomain);
      urlencoded.append('state', shopifyStoreState);

      const res = await fetch(`${appUrl}/session/validate`, {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow',
      });

      const isOk = res.status === 200;
      const response = await res.json();

      if (isOk) {
        setCookie('storeSetting', JSON.stringify(response.data[0]), 1);
        setLocalStorage('storeSetting', response.data[0]);
      }

      return isOk;
    } catch (error) {
      return false;
    }
  }

  if (await validateCreds()) {
    let loader;

    const icons = {
      user: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512" class="fill-white"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg>',
      tag: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512" style="fill:#fff" class="mx-auto"><path d="M0 80V229.5c0 17 6.7 33.3 18.7 45.3l176 176c25 25 65.5 25 90.5 0L418.7 317.3c25-25 25-65.5 0-90.5l-176-176c-12-12-28.3-18.7-45.3-18.7H48C21.5 32 0 53.5 0 80zm112 32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>',
      chevronUp:
        '<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512"><path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"/></svg>',
      chevronDown:
        '<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512"><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>',
      expand:
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13.4528 1.0415C13.2871 1.0415 13.1281 1.10735 13.0109 1.22456C12.8937 1.34177 12.8278 1.50074 12.8278 1.6665C12.8278 1.83226 12.8937 1.99124 13.0109 2.10845C13.1281 2.22566 13.2871 2.2915 13.4528 2.2915H16.8245L12.0578 7.05817C11.944 7.1761 11.8811 7.33401 11.8826 7.49788C11.8841 7.66175 11.9499 7.81848 12.0658 7.93431C12.1818 8.05013 12.3386 8.11579 12.5024 8.11714C12.6663 8.11848 12.8242 8.05541 12.942 7.9415L17.7087 3.17484V6.54734C17.7087 6.7131 17.7745 6.87207 17.8917 6.98928C18.0089 7.10649 18.1679 7.17234 18.3337 7.17234C18.4994 7.17234 18.6584 7.10649 18.7756 6.98928C18.8928 6.87207 18.9587 6.7131 18.9587 6.54734V1.6665C18.9587 1.50074 18.8928 1.34177 18.7756 1.22456C18.6584 1.10735 18.4994 1.0415 18.3337 1.0415H13.4528ZM6.54783 18.9582C6.71359 18.9582 6.87256 18.8923 6.98977 18.7751C7.10698 18.6579 7.17283 18.4989 7.17283 18.3332C7.17283 18.1674 7.10698 18.0084 6.98977 17.8912C6.87256 17.774 6.71359 17.7082 6.54783 17.7082H3.17616L7.94283 12.9415C8.00249 12.8838 8.05007 12.8148 8.08279 12.7386C8.11551 12.6623 8.13271 12.5803 8.13339 12.4973C8.13408 12.4143 8.11822 12.332 8.08676 12.2552C8.0553 12.1784 8.00886 12.1087 7.95015 12.05C7.89144 11.9914 7.82163 11.945 7.74481 11.9136C7.66799 11.8822 7.58568 11.8664 7.50269 11.8672C7.41971 11.8679 7.3377 11.8852 7.26147 11.918C7.18523 11.9508 7.11629 11.9985 7.05866 12.0582L2.29199 16.8248V13.4523C2.29199 13.3703 2.27583 13.289 2.24442 13.2132C2.21301 13.1373 2.16697 13.0684 2.10893 13.0104C2.0509 12.9524 1.982 12.9063 1.90617 12.8749C1.83034 12.8435 1.74907 12.8273 1.66699 12.8273C1.58492 12.8273 1.50364 12.8435 1.42782 12.8749C1.35199 12.9063 1.28309 12.9524 1.22505 13.0104C1.16701 13.0684 1.12098 13.1373 1.08957 13.2132C1.05816 13.289 1.04199 13.3703 1.04199 13.4523V18.3332C1.04199 18.6782 1.32199 18.9582 1.66699 18.9582H6.54783Z" /></svg>',
      share:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 10.7202C11.4933 10.7202 11.04 10.9202 10.6933 11.2335L5.94 8.46683C5.97333 8.3135 6 8.16016 6 8.00016C6 7.84016 5.97333 7.68683 5.94 7.5335L10.64 4.7935C11 5.12683 11.4733 5.3335 12 5.3335C13.1067 5.3335 14 4.44016 14 3.3335C14 2.22683 13.1067 1.3335 12 1.3335C10.8933 1.3335 10 2.22683 10 3.3335C10 3.4935 10.0267 3.64683 10.06 3.80016L5.36 6.54016C5 6.20683 4.52667 6.00016 4 6.00016C2.89333 6.00016 2 6.8935 2 8.00016C2 9.10683 2.89333 10.0002 4 10.0002C4.52667 10.0002 5 9.7935 5.36 9.46016L10.1067 12.2335C10.0733 12.3735 10.0533 12.5202 10.0533 12.6668C10.0533 13.7402 10.9267 14.6135 12 14.6135C13.0733 14.6135 13.9467 13.7402 13.9467 12.6668C13.9467 11.5935 13.0733 10.7202 12 10.7202Z"/></svg>',
      search:
        '<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>',
      shoppingBag:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><g clip-path="url(#clip0_178_22442)"><path d="M11.1691 6.84615V3.38462C11.1691 2.61957 10.8353 1.88585 10.241 1.34488C9.64676 0.803914 8.84077 0.5 8.00037 0.5C7.15997 0.5 6.35399 0.803914 5.75973 1.34488C5.16548 1.88585 4.83163 2.61957 4.83163 3.38462V6.84615M14.4274 5.31308L15.4947 14.5438C15.5538 15.0554 15.1144 15.5 14.5491 15.5H1.45164C1.31831 15.5001 1.18643 15.4747 1.06459 15.4254C0.942743 15.3761 0.833651 15.3041 0.744398 15.2139C0.655145 15.1237 0.587727 15.0175 0.546525 14.902C0.505323 14.7866 0.491259 14.6646 0.505244 14.5438L1.57332 5.31308C1.59796 5.10043 1.7082 4.90362 1.8828 4.76058C2.0574 4.61755 2.28399 4.53842 2.51887 4.53846H13.4819C13.9686 4.53846 14.3767 4.87308 14.4274 5.31308ZM5.14851 6.84615C5.14851 6.92266 5.11512 6.99603 5.0557 7.05013C4.99627 7.10422 4.91567 7.13462 4.83163 7.13462C4.74759 7.13462 4.66699 7.10422 4.60757 7.05013C4.54814 6.99603 4.51476 6.92266 4.51476 6.84615C4.51476 6.76965 4.54814 6.69628 4.60757 6.64218C4.66699 6.58808 4.74759 6.55769 4.83163 6.55769C4.91567 6.55769 4.99627 6.58808 5.0557 6.64218C5.11512 6.69628 5.14851 6.76965 5.14851 6.84615ZM11.486 6.84615C11.486 6.92266 11.4526 6.99603 11.3932 7.05013C11.3338 7.10422 11.2532 7.13462 11.1691 7.13462C11.0851 7.13462 11.0045 7.10422 10.945 7.05013C10.8856 6.99603 10.8522 6.92266 10.8522 6.84615C10.8522 6.76965 10.8856 6.69628 10.945 6.64218C11.0045 6.58808 11.0851 6.55769 11.1691 6.55769C11.2532 6.55769 11.3338 6.58808 11.3932 6.64218C11.4526 6.69628 11.486 6.76965 11.486 6.84615Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_178_22442"><rect width="16" height="16"/></clipPath></defs></svg>',
      dres: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><g clip-path="url(#clip0_178_22566)"><path d="M16.7733 16.3828C16.771 16.3761 16.7681 16.3696 16.7647 16.3633L13.2116 8.79609L14.8132 6.28203C14.8163 6.27752 14.8192 6.27283 14.8218 6.26797C14.9383 6.07373 14.9998 5.8515 14.9998 5.625C14.9998 5.3985 14.9383 5.17627 14.8218 4.98203C14.8147 4.96953 14.8062 4.95703 14.7983 4.94531L13.1249 2.55469V0.625C13.1249 0.45924 13.0591 0.300269 12.9418 0.183058C12.8246 0.065848 12.6657 0 12.4999 0C12.3341 0 12.1752 0.065848 12.058 0.183058C11.9408 0.300269 11.8749 0.45924 11.8749 0.625V2.53281L11.464 3.04688C11.2883 3.26643 11.0655 3.44366 10.8121 3.56546C10.5587 3.68725 10.2811 3.75049 9.9999 3.75049C9.71873 3.75049 9.44115 3.68725 9.18772 3.56546C8.9343 3.44366 8.7115 3.26643 8.53584 3.04688L8.1249 2.53281V0.625C8.1249 0.45924 8.05906 0.300269 7.94185 0.183058C7.82464 0.065848 7.66566 0 7.4999 0C7.33414 0 7.17517 0.065848 7.05796 0.183058C6.94075 0.300269 6.8749 0.45924 6.8749 0.625V2.55469L5.20147 4.94531C5.19365 4.95703 5.18506 4.96953 5.17803 4.98203C5.06153 5.17627 4.99999 5.3985 4.99999 5.625C4.99999 5.8515 5.06153 6.07373 5.17803 6.26797C5.18061 6.27283 5.18348 6.27752 5.18662 6.28203L6.78819 8.79609L3.23506 16.3633C3.23173 16.3696 3.22886 16.3761 3.22647 16.3828C3.14505 16.5729 3.11205 16.7802 3.13044 16.9862C3.14883 17.1921 3.21803 17.3903 3.33184 17.563C3.44565 17.7356 3.60051 17.8773 3.78255 17.9754C3.96459 18.0735 4.16812 18.1249 4.3749 18.125H15.6249C15.8318 18.125 16.0354 18.0737 16.2175 17.9757C16.3997 17.8777 16.5546 17.736 16.6685 17.5633C16.7824 17.3906 16.8517 17.1924 16.8701 16.9864C16.8886 16.7803 16.8556 16.573 16.7741 16.3828H16.7733ZM6.2499 5.625L7.5335 3.79453L7.55928 3.82734C7.85204 4.19345 8.22341 4.48901 8.64589 4.69211C9.06837 4.89522 9.53114 5.00068 9.9999 5.00068C10.4687 5.00068 10.9314 4.89522 11.3539 4.69211C11.7764 4.48901 12.1478 4.19345 12.4405 3.82734L12.4663 3.79453L13.7499 5.625L12.1577 8.125H7.84287L6.2499 5.625ZM4.3749 16.875L7.896 9.375H12.1022L15.6249 16.875H4.3749Z"/></g><defs><clipPath id="clip0_178_22566"><rect width="20" height="20"/></clipPath></defs></svg>',
      duplicate:
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15.8984 5H7.22656C5.99687 5 5 5.99687 5 7.22656V15.8984C5 17.1281 5.99687 18.125 7.22656 18.125H15.8984C17.1281 18.125 18.125 17.1281 18.125 15.8984V7.22656C18.125 5.99687 17.1281 5 15.8984 5Z" stroke="white" stroke-linejoin="round"/><path d="M14.9805 5L15 4.0625C14.9984 3.48285 14.7674 2.9274 14.3575 2.51753C13.9476 2.10765 13.3922 1.87665 12.8125 1.875H4.375C3.71256 1.87696 3.07781 2.14098 2.6094 2.6094C2.14098 3.07781 1.87696 3.71256 1.875 4.375V12.8125C1.87665 13.3922 2.10765 13.9476 2.51753 14.3575C2.9274 14.7674 3.48285 14.9984 4.0625 15H5M11.5625 8.4375V14.6875M14.6875 11.5625H8.4375" stroke="white" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      link: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><g clip-path="url(#clip0_179_48976)"><path d="M9.52533 8.11093C9.26287 7.84843 9.10707 7.49794 9.08804 7.12723C9.06902 6.75652 9.18812 6.39192 9.42233 6.10393L9.52533 5.98993L11.6463 3.86793C12.7549 2.75271 14.257 2.11727 15.8294 2.09834C17.4017 2.0794 18.9187 2.67849 20.0538 3.76669C21.1889 4.85489 21.8515 6.34521 21.8989 7.91697C21.9463 9.48873 21.3748 11.0163 20.3073 12.1709L20.1323 12.3539L18.0103 14.4749C17.7382 14.7458 17.3726 14.902 16.9888 14.9114C16.605 14.9208 16.2322 14.7826 15.9472 14.5254C15.6621 14.2682 15.4866 13.9115 15.4567 13.5287C15.4268 13.146 15.5447 12.7663 15.7863 12.4679L15.8893 12.3539L18.0103 10.2319C18.5574 9.68073 18.8695 8.93884 18.8808 8.16229C18.8922 7.38575 18.6019 6.63506 18.0711 6.06813C17.5403 5.5012 16.8103 5.1622 16.0347 5.12244C15.2591 5.08268 14.4983 5.34525 13.9123 5.85493L13.7683 5.98993L11.6463 8.11093C11.365 8.39214 10.9836 8.55011 10.5858 8.55011C10.1881 8.55011 9.80662 8.39214 9.52533 8.11093ZM8.81833 15.1819C8.55587 14.9194 8.40007 14.5689 8.38104 14.1982C8.36202 13.8275 8.48112 13.4629 8.71533 13.1749L8.81833 13.0609L13.0613 8.81793C13.3331 8.54516 13.6994 8.38736 14.0843 8.3772C14.4692 8.36703 14.8433 8.50528 15.1291 8.76333C15.4149 9.02137 15.5905 9.37944 15.6196 9.7634C15.6487 10.1474 15.529 10.5278 15.2853 10.8259L15.1823 10.9399L10.9393 15.1819C10.658 15.4631 10.2766 15.6211 9.87883 15.6211C9.48109 15.6211 9.09962 15.4631 8.81833 15.1819ZM3.86833 20.1319C2.77428 19.0377 2.14527 17.5631 2.11266 16.0161C2.08005 14.4691 2.64637 12.9693 3.69333 11.8299L3.86833 11.6459L5.99033 9.52593C6.26243 9.25508 6.62803 9.09887 7.01185 9.08947C7.39566 9.08008 7.76847 9.21821 8.05349 9.47543C8.33852 9.73264 8.51407 10.0894 8.54399 10.4721C8.57391 10.8549 8.45593 11.2345 8.21433 11.5329L8.11133 11.6469L5.99033 13.7669C5.43995 14.3174 5.12511 15.0603 5.1123 15.8386C5.09949 16.617 5.38972 17.3698 5.92169 17.9381C6.45366 18.5064 7.1857 18.8457 7.96318 18.8843C8.74067 18.9229 9.50271 18.6578 10.0883 18.1449L10.2323 18.0099L12.3543 15.8899C12.6264 15.6191 12.992 15.4629 13.3758 15.4535C13.7597 15.4441 14.1325 15.5822 14.4175 15.8394C14.7025 16.0966 14.8781 16.4534 14.908 16.8361C14.9379 17.2189 14.8199 17.5985 14.5783 17.8969L14.4753 18.0099L12.3543 20.1319C11.7972 20.6892 11.1357 21.1312 10.4077 21.4328C9.67965 21.7344 8.89935 21.8896 8.11133 21.8896C7.32332 21.8896 6.54302 21.7344 5.815 21.4328C5.08698 21.1312 4.4255 20.6892 3.86833 20.1319Z"/></g><defs><clipPath id="clip0_179_48976"><rect width="24" height="24" fill="white" transform="matrix(0 -1 1 0 0 24)"/></clipPath></defs></svg>',
      error: `<svg style="width: 20px" aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 13 13">
            <circle cx="6.5" cy="6.50049" r="5.5" stroke="white" stroke-width="2"/>
            <circle cx="6.5" cy="6.5" r="5.5" fill="#EB001B" stroke="#EB001B" stroke-width="0.7"/>
            <path d="M5.87413 3.52832L5.97439 7.57216H7.02713L7.12739 3.52832H5.87413ZM6.50076 9.66091C6.88091 9.66091 7.18169 9.37267 7.18169 9.00504C7.18169 8.63742 6.88091 8.34917 6.50076 8.34917C6.12061 8.34917 5.81982 8.63742 5.81982 9.00504C5.81982 9.37267 6.12061 9.66091 6.50076 9.66091Z" fill="white"/>
            <path d="M5.87413 3.17832H5.51535L5.52424 3.537L5.6245 7.58083L5.63296 7.92216H5.97439H7.02713H7.36856L7.37702 7.58083L7.47728 3.537L7.48617 3.17832H7.12739H5.87413ZM6.50076 10.0109C7.06121 10.0109 7.5317 9.57872 7.5317 9.00504C7.5317 8.43137 7.06121 7.99918 6.50076 7.99918C5.94031 7.99918 5.46982 8.43137 5.46982 9.00504C5.46982 9.57872 5.94031 10.0109 6.50076 10.0109Z" fill="white" stroke="#EB001B" stroke-width="0.7">
        </svg>`,
      close: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" role="presentation" class="icon icon-close" fill="none" viewBox="0 0 18 17">
        <path d="M.865 15.978a.5.5 0 00.707.707l7.433-7.431 7.579 7.282a.501.501 0 00.846-.37.5.5 0 00-.153-.351L9.712 8.546l7.417-7.416a.5.5 0 10-.707-.708L8.991 7.853 1.413.573a.5.5 0 10-.693.72l7.563 7.268-7.418 7.417z" fill="currentColor">
      </svg>
      `,
      minus: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" role="presentation" class="icon icon-minus" fill="none" viewBox="0 0 10 2">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M.5 1C.5.7.7.5 1 .5h8a.5.5 0 110 1H1A.5.5 0 01.5 1z" fill="currentColor">
      </svg>
      `,
      plus: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" role="presentation" class="icon icon-plus" fill="none" viewBox="0 0 10 10">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M1 4.51a.5.5 0 000 1h3.5l.01 3.5a.5.5 0 001-.01V5.5l3.5-.01a.5.5 0 00-.01-1H5.5L5.49.99a.5.5 0 00-1 .01v3.5l-3.5.01H1z" fill="currentColor">
      </svg>
      `,
      remove: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false" role="presentation" class="icon icon-remove">
        <path d="M14 3h-3.53a3.07 3.07 0 00-.6-1.65C9.44.82 8.8.5 8 .5s-1.44.32-1.87.85A3.06 3.06 0 005.53 3H2a.5.5 0 000 1h1.25v10c0 .28.22.5.5.5h8.5a.5.5 0 00.5-.5V4H14a.5.5 0 000-1zM6.91 1.98c.23-.29.58-.48 1.09-.48s.85.19 1.09.48c.2.24.3.6.36 1.02h-2.9c.05-.42.17-.78.36-1.02zm4.84 11.52h-7.5V4h7.5v9.5z" fill="currentColor"/>
        <path d="M6.55 5.25a.5.5 0 00-.5.5v6a.5.5 0 001 0v-6a.5.5 0 00-.5-.5zM9.45 5.25a.5.5 0 00-.5.5v6a.5.5 0 001 0v-6a.5.5 0 00-.5-.5z" fill="currentColor"/>
      </svg>
      `,
    };

    if (!customer) throw new Error('Missing variable customer');
    let storeSetting = getLocalStorage('storeSetting');

    const customerId = customer.id;
    const first_name = customer.firstName;
    const last_name = customer.lastName;
    const email = customer.email;
    const userId = customer.id;

    let productSize = product !== null ? product.variants[0].option1 : '';
    let productVariant = product !== null ? product.variants[0].id : '';
    let variants;

    const storeDomain = `https://${shopifyStoreDomain}`;
    const store = `https://${shopifyStoreDomain}`;

    const user = email;

    let invQty = product !== null ? product.inventoryQty : '';
    let productId = product !== null ? product.id : '';
    let productPrice = product !== null ? product.price : '';
    let productURL = product !== null ? product.url : '';
    let productImgURL = product !== null ? product.featured_image.src : '';
    let productVarId = productVariant;
    let custEmail = email;
    let custFName = first_name;
    let custLName = last_name;

    const textColor = storeSetting !== null ? storeSetting?.loginPromptSettings?.color : '';
    const text =
      storeSetting !== null
        ? storeSetting?.loginPromptSettings?.promptText && storeSetting?.loginPromptSettings?.promptText !== ''
          ? storeSetting?.loginPromptSettings?.promptText
          : ''
        : '';

    const closeModalButton = $(
      `<div id="close-modal" class="btn-close cursor-pointer flex justify-end align-center">${icons.close}</div> `
    );

    const loginModal = $(`<div id="login-modal" class="modal" style="display: none;">
        <div class="login-modal" id="modal-dialog">
            <div class="modal-header">
            <h3 style="color: ${textColor}">My Wishlist</h3>
            <p style="color: ${textColor}">${text !== ''
        ? text
        : "My Wishlist allows you to keep track of all of your favorites and shopping activity whether you're on your computer, phone, or tablet. You won't have to waste time searching all over again for that item you loved on your phone the other day - it's all here in one place!<br/>And you must have an account and be logged in to save items to your wishlist."
      }</p>
            </div>
            <div class="modal-body">
            <div class="auth-items">
                <div class="auth-item">
                <h4>LOGIN</h4>
                ${loginFormString}
                </div>
                <div class="auth-item">
                <h4>CREATE AN ACCOUNT</h4>
                ${registerFormString}
                </div>
            </div>
            </div>
        </div>
    </div>`);

    function createAddToCart(data = '') {
      const totalPrice = data?.products.reduce((sum, product) => sum + product.productPrice, 0);
      const modal = $(`
          <div id="add-to-cart-modal" class="modal add-to-cart-modal" style="display: block">
              <div class="modal-content p-0" style="width: 655px">
                  <div class="modal-head p-5">
                      <div class="block relative">
                          <h4 class="h4 m-0 w-90 title font-bold">
                              Shopping Cart
                          </h4>
                          <div id="btn-close" class="right-0 absolute cursor-pointer btn-close">
                              ${icons.close}
                          </div>
                      </div>
                  </div>
                  <div class="modal-body p-5">
                      ${data?.products
          .map(
            (item, index) => `
                          <div class="flex list justify-between mx-auto mt-5 mb-5">
                              <div class="image">
                                  <img src="${item.productImage}" alt="${item.productName}" >
                              </div>
                              <div class="block px-3 w-full">
                                  <p class="m-0 leading-none">
                                      <span class="font-bold">${item.productName}</span>
                                  </p>
                                  <p class="m-0">
                                      <span class="font-bold size">Size : ${item?.productSize}</span>
                                  </p>
                                  <div class="quantity">
                                      <button class="quantity__button no-js-hidden" name="minus" type="button" onClick="decrementQuantity('quantity${index}')">
                                        ${icons.minus}
                                      </button>
                                      <input type="hidden" id="variant${index}" value="${item?.productVariant}">
                                      <input class="quantity__input" type="number" id="quantity${index}" value="1" readonly>
                                      <button class="quantity__button no-js-hidden" name="plus" type="button" onClick="incrementQuantity('quantity${index}')">
                                      ${icons.plus}
                                      </button>
                                  </div>
                              </div>
                              <div class="px-3 flex justify-end">
                                  <div>
                                      <div class="remove bullet rounded-full cursor-pointer">${icons.remove}</div>
                                      <div class="price">
                                          ${item?.productPrice}
                                      </div>
                                  </div>
                              </div>

                          </div>
                      `
          )
          .join('')}
                  </div>
                  <div class="confirm w-full p-5 mt-5">
                      <div class="flex justify-between w-full">
                          <div class="flex align-center size font-bold total_item">
                              ${data?.products.length} Items
                          </div>
                          <div class="flex justify-end align-center size">
                              Sub-total: <span class="font-bold total_price"> ${totalPrice} </span>
                          </div>
                      </div>

                      <p class="text-center mb-0">Shipping & Taxes Calculated at Checkout</p>
                      <div id="button-checkout" class="w-full mt-8 ">
                          <button id="btn-proccess" class="py-4 btn-black px-5">PROCEED TO CHECKOUT</button>
                      </div>
                  </div>
              </div>
          </div>
      `);
      return modal;
    }

    function removeQueryString(url) {
      return url.split('?')[0];
    }

    function groupByProperty(items, propertyName) {
      return items.reduce((result, item) => {
        const key = item[propertyName];
        const { [propertyName]: propertyValue, ...rest } = item;

        if (!result[key]) result[key] = [];

        result[key].push(rest);
        return result;
      }, {});
    }

    async function getWishlist(userId, store, id = '') {
      try {
        let q = {};
        if (id !== '') q.id = id;
        else q.isCheckedout = true;
        const param = { param: JSON.stringify(q) };
        const requestOptions = {
          url: `${appUrl}/wishlist`,
          method: 'GET',
          data: {
            userId: userId,
            store: store,
            page: 1,
            limit: 10,
            sort: {
              key: 'Created Date',
              direction: 'desc',
            },
            ...param,
          },
          timeout: 0,
        };
        return new Promise((resolve, reject) => {
          $.ajax(requestOptions)
            .done(function (response) {
              const res = response.data.items;
              if (res) {
                const simplifiedWishlist = res.map((item) => ({
                  _id: item._id,
                  store: item.store,
                  name: item.name,
                  products: item.products
                    .filter((product) => (q.id ? product : product.isCheckedout === true))
                    .map((product) => ({
                      _id: product._id,
                      productId: product.productId,
                      productName: product.productName,
                      productPrice: product.productPrice,
                      productSize: product.productSize,
                      productPriceCurrency: product.productPriceCurrency ? product.productPriceCurrency : '',
                      productVariant: product.productVariant,
                      productImage: removeQueryString(product.productImage),
                      capsule: product.capsule && product.capsule.name ? product.capsule.name : 'Uncategorized',
                    })),
                  comments: item.comments.map((comment) => ({
                    comment: comment.comment,
                    createdAt: comment.createdAt,
                    commentedBy: {
                      first_name: comment.commentedBy.first_name,
                      last_name: comment.commentedBy.last_name,
                      email: comment.commentedBy.email,
                      userId: comment.commentedBy.userId,
                    },
                  })),
                }));
                if (id === '') setLocalStorage('wishlist', simplifiedWishlist); // no need save for getWishlist by id

                resolve({
                  success: true,
                  data: response.data,
                  simplified: simplifiedWishlist,
                });
              } else {
                reject(new Error('No data in the response'));
              }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              // Reject the promise with the error details
              reject(new Error(`AJAX request failed: ${textStatus}, ${errorThrown}`));
            });
        });
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }

    async function addComment(data) {
      try {
        const obj = {
          store,
          comments: data?.comments
            ? [
              {
                comment: data?.comments,
                commentedBy: {
                  first_name,
                  last_name,
                  email,
                  userId,
                },
              },
            ]
            : undefined,
          createdBy: {
            first_name,
            last_name,
            email,
            userId,
          },
        };
        const requestOptions = {
          method: 'POST',
          body: JSON.stringify(obj),
          redirect: 'follow',
        };
        const response = await fetch(`${appUrl}/wishlist/${data.wishlistId}/comment`, requestOptions);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        return {
          success: true,
          ...result,
        };
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }
    async function getProductById(id) {
      const handle = (
        await fetch(`/search/suggest.json?q=id:${id}&resources[type]=product&limit=1`)
          .then((response) => response.json())
          .then((response) => response.resources.results.products.shift())
      ).handle;

      return await fetch(`/products/${handle}.js`).then((response) => response.json());
    }

    async function renderProductDetail(data) {
      console.log('renderProductDetail data =>', data);
      const div = document.createElement('DIV');
      div.classList.add('flex', 'w-full', 'product-single');
      div.style.minHeight = '430px';
      div.innerHTML = `
        <div class="column-images flex">
            <div class="product-thumbnails">
                ${data?.images.map((image) => `<img src="${image}" />`).join('')}
            </div>
            <div class="product-images">
                <img src="${data?.featured_image}" />
            </div>
        </div>
        <div class="column-details">
            <label>Capsule</label>
            <br />
            <div class="select-botton-container">
              <div class="dropdown">
                  <button class="dropbtn drop-capsule bg-none no-border text-left">
                      <div class="chevron right-0">
                          ${icons.chevronDown}
                      </div>
                      <span>${data?.capsule && data?.capsule !== '' ? data?.capsule : 'Select'} </span>
                  </button>
                  <div class="dropdown-content w-full" style="display: none;">
                  </div>
              </div>
            </div>
            <h1 class="product-title">${data?.title}</h1>
            <div>
                <p class="product-vendor m-0">${data?.vendor}</p>
            </div>
            <p class="price"><span>${data.priceCurrency && data.priceCurrency !== '' ? data.priceCurrency : data?.price
        }</span></p>
            <div class="product-form">
                <div class="select-size">
                    Select Size:
                </div>
                <div class="product-form-item-inner">
                    <fieldset class="single-option-radio" name="size" id="ProductSelect-option-1" style="display: block;">
                        ${data?.variants
          .map(
            (variant, index) => `<input
                            type="radio" ${variant.id === data?.productVariant ? 'checked="checked"' : ''}  value="${variant?.id
              }" name="size" class="single-option-selector"
                            id="ProductSelect-option-size-${index}" data-variant-id="${variant?.id}">
                            <label for="ProductSelect-option-size-${index}" ><span>${variant?.title}</span></label>`
          )
          .join('')}
                    </fieldset>
                </div>
                <div class="form-actions">
                    <button type="submit" name="add" class="addtocart btn product-button">
                        <span>ADD TO CART</span>
                    </button>
                </div>
            </div>
            <div class="product-description">
                <p>${data?.description}.</p>
            </div>
            <div class="collapsible flex justify-between" data-content-id="collapsContent1" data-button-id="btnCollaps1">
                <div>PRODUCT DETAILS</div>
                <button class="btn-collaps">+</button>
            </div>
            <div class="collaps-content" id="collapsContent1">
                <p></p>
            </div>

            <div class="collapsible" data-content-id="collapsContent2" data-button-id="btnCollaps2">
                <div>SHIPPING & RETURNS</div>
                <button class="btn-collaps">+</button>
            </div>
            <div class="collaps-content" id="collapsContent2">
                <p></p>
            </div>

        </div>
        `;
      return div;
    }

    function getInitials(str) {
      var words = str.split(' ');
      var initials = words
        .map(function (word) {
          return word.charAt(0);
        })
        .join('');
      return initials.toUpperCase();
    }

    incrementQuantity = function incrementQuantity(inputId) {
      var quantityInput = document.getElementById(inputId);
      var currentQuantity = parseInt(quantityInput.value, 10);

      // You can add validation if needed
      currentQuantity = isNaN(currentQuantity) ? 1 : currentQuantity;

      // Increment the quantity
      currentQuantity++;

      // Update the input field with the new quantity
      quantityInput.value = currentQuantity;
    }

    decrementQuantity = function decrementQuantity(inputId) {
      var quantityInput = document.getElementById(inputId);
      var currentQuantity = parseInt(quantityInput.value, 10);

      // You can add validation if needed
      currentQuantity = isNaN(currentQuantity) ? 1 : currentQuantity;

      // Ensure the quantity doesn't go below 1
      if (currentQuantity > 1) {
        // Decrement the quantity
        currentQuantity--;

        // Update the input field with the new quantity
        quantityInput.value = currentQuantity;
      }
    }
    async function renderLoader(minHeight = '430px') {
      const d = document.createElement('DIV');
      d.classList.add('flex', 'flex-wrap', 'align-center', 'render-loader');
      d.style.minHeight = minHeight;
      d.innerHTML = `<div class="loader" style="display: block"></div>`;
      return d;
    }

    function renderComment(data) {
      const fullName = `${data.commentedBy.first_name} ${data.commentedBy.last_name}`;
      const div = document.createElement('DIV');
      div.classList.add('flex', 'w-full', 'justify-between', 'gap-8', 'mb-5');
      div.innerHTML = `
        <div class="flex justify-between w-full gap-8 mb-5">
            <div class="flex flex-wrap align-center">
                <div class="bullet rounded-full">
                    <div class="text-center w-full">
                        <span class="text-center w-full">${getInitials(fullName)}</span>
                    </div>
                </div>
            </div>
            <div class="flex w-full">
                <div class="input-group w-full">
                    <div class="text">
                        <label>${fullName}<label>
                        <p>${data.comment}</p>
                    </div>
                    <div class="time">
                        <p>${timeAgo(data.createdAt)}</p>
                    </div>
                </div>
            </div>
        </div>
        `;
      return div;
    }

    function handlelistComment(isFirst = true, isOpen, comments, isPopup = true) {
      console.log('handlelistComment =>', {
        isOpen: isOpen,
        comments: comments,
      });
      if (isFirst) comments = comments.slice(0, 3);
      const container = isPopup ? $('#my-wishlist-detail') : $('.page-width').find('.detail-content');

      container.find('.comment .btn-chevron').empty();
      container.find('.comment .btn-chevron').html(`${isOpen ? icons.chevronUp : icons.chevronDown}`);

      if (!isFirst) {
        container.find('#my-wishlist-detail-content').css({ display: isOpen ? 'none' : '' });
        container.find('.sub-heading').css({ display: isOpen ? 'none' : '' });
      }

      if (isOpen) {
        if (comments) {
          container.find('#list-comment').html('');
          comments.forEach((comment) => {
            const rComment = renderComment(comment);
            container.find('#list-comment').prepend(rComment);
          });
        }
      } else {
        container.find('#list-comment').html('');
      }
    }

    function timeAgo(createdAt) {
      const currentDate = new Date();
      const createdDate = new Date(createdAt);

      const timeDifference = currentDate - createdDate;
      const seconds = Math.floor(timeDifference / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const weeks = Math.floor(days / 7);
      const months = Math.floor(days / 30);

      if (months > 0) {
        return months === 1 ? '1 month ago' : `${months} months ago`;
      } else if (weeks > 0) {
        return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
      } else if (days > 0) {
        return days === 1 ? '1 day ago' : `${days} days ago`;
      } else if (hours > 0) {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
      } else if (minutes > 0) {
        return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
      } else {
        return 'Just now';
      }
    }

    function createConfirm(text = '') {
      const modal = $(`
            <div id="confirm-modal" class="modal" style="display: block">
                <div class="modal-content" style="width: 385px;">
                  <div class="modal-body p-0 text-center">
                    <p>${text === '' ? 'Are you sure want to remove the item? You cannot undo this step.' : text}</p>
                    <div class="confirm flex gap-4 w-1/2 mx-auto">
                        <button id="confirm-no" class="p-2">No</button>
                        <button id="confirm-yes" class="p-2">Yes</button>
                    </div>
                  </div>
                </div>
            </div>
        `);
      return modal;
    }

    function createNotification(content) {
      const modal = $(`
            <div id="notification" class="modal" style="display: block">
                <div class="modal-content bg-white p-5" style="top: 13%; left: 0; transform: unset; width: 544px; margin: 0; background: #F5F5F5;">
                    <div class="modal-body">
                        <div class="block relative">
                            <div id="btn-close" class="top-0 right-0 absolute cursor-pointer btn-close">
                                ${icons.close}
                            </div>
                        </div>
                        ${content}
                    </div>
                </div>
            </div>
        `);
      return modal;
    }

    async function addToCart(items, wishlistDetail, isWishlist = true) {
      const formData = { items: items };

      try {
        const response = await fetch(window.Shopify.routes.root + 'cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        // Check if the request was successful (status code 2xx)
        if (response.ok) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // add delay
          //$("#my-wishlist-modal").remove();
          const notif = createNotification(`<div class="flex">
                <img src="${wishlistDetail.productImage}" width="64">
                <div class="flex flex-wrap align-center px-3 w-full">
                    <p>${isWishlist ? 'All items on ' : ''}
                        <span class="font-bold">${wishlistDetail.name}</span> have been added to the cart successfully.
                    </p>
                </div>
            </div>`);
          $('body').append(notif);
          notif.find('.modal-content')[0].classList.add('animate__animated', 'animate__slideInDown');

          await new Promise((resolve) => setTimeout(resolve, 2000)); // add delay
          notif.remove();
          return { success: true };
        } else {
          throw new Error('Failed to add items to the cart');
        }
      } catch (error) {
        console.error(error);
        return { success: false };
      }
    }

    function openLoginModal() {
      $('body').append(loginModal);
      let st = storeSetting;
      const textColor = st !== null ? st.loginPromptSettings.color : '';
      const text =
        st !== null
          ? st.loginPromptSettings.promptText && st.loginPromptSettings.promptText !== ''
            ? st.loginPromptSettings.promptText
            : ''
          : '';
      // force re-new, for new update (localstorage)
      const modalHeader = loginModal.find('.modal-header');
      if (modalHeader && text !== '') {
        modalHeader.html('');
        const newContent = $(`
              <h3 style="color:${textColor}">My Wishlist</h3>
              <p style="color:${textColor}">${text}</p>`);
        modalHeader.append(newContent);
      }
      closeModalButton.prependTo('.login-modal#modal-dialog');
      loginModal.show();
    }

    async function handleWishlistUpdate(data, product = [], isFlaging = true) {
      try {
        const confirm = createAddToCart(data ? data : '');
        $('body').append(confirm);

        confirm.find('#btn-close').on('click', function () {
          confirm.remove();
        });

        confirm.find('.remove').on('click', function () {
          const listItem = $(this).closest('.list');
          const priceText = listItem.find('.price').text().trim(); // Retrieve the price HTML value and trim spaces
          const price = parseFloat(priceText.replace(/[^\d.]/g, '')); // Convert to number by removing non-numeric characters

          if (listItem) listItem.remove();
          const items = confirm.find('.modal-body .list');
          const totalPriceText = confirm.find('.total_price')[0].innerHTML.trim();
          const totalPrice = parseFloat(totalPriceText.replace(/[^\d.]/g, ''));
          confirm.find('.total_item')[0].innerHTML = `${items.length} Items`;
          confirm.find('.total_price')[0].innerHTML = `${totalPrice - price}`;
        });

        confirm.find('#btn-proccess').on('click', async function () {
          const cartData = product;
          if (cartData?.length === 0) {
            data?.products.forEach((item, index) => {
              const variantInput = document.getElementById(`variant${index}`);
              const quantityInput = document.getElementById(`quantity${index}`);

              if (variantInput && quantityInput) {
                const variantId = parseInt(variantInput.value, 10);
                const quantity = parseInt(quantityInput.value, 10);

                cartData.push({
                  variant_id: variantId,
                  quantity: quantity,
                });
              }
            });
          }

          if (cartData.length === 0) return;

          localStorage.removeItem('cartData');
          const isUpdate = data?.products?.length === cartData?.length ? 'wishlist' : 'product';
          setLocalStorage('cartData', {
            id: data?._id,
            ufpdate: isUpdate,
            products: cartData,
          });

          confirm.find('#button-checkout').empty();
          loader = await renderLoader('0');
          confirm.find('#button-checkout').append(loader);

          await new Promise((resolve) => setTimeout(resolve, 1000)); // add delay
          const body = {
            checkout: {
              line_items: cartData,
              note: isFlaging ? `wishlist-app:${data?._id}` : 'wishlist-app',
            },
            shop: shopifyStoreDomain,
            state: shopifyStoreState,
          };

          const requestOptions = {
            method: 'POST',
            body: JSON.stringify(body),
            redirect: 'follow',
          };
          const response = await fetch(`${appUrl}/shopify/checkout`, requestOptions);
          if (response.ok) {
            const result = await response.json();
            if (result?.data?.checkout?.web_url) window.location.href = result?.data?.checkout?.web_url;
          } else {
            const result = await response.json();
            console.log('error =>', result);
            confirm.find('#button-checkout').empty();
            confirm
              .find('#button-checkout')
              .html('<button id="btn-proccess" class="py-4 btn-black px-5">PROCEED TO CHECKOUT</button>');
          }
        });
      } catch (error) {
        return { success: false };
      }
    }

    $(document).on('click', '#close-modal', () => loginModal.remove());

    const getElementValue = (id) => document.getElementById(id).value;

    const currentUrl = window.location.href;

    myWishlistContent = $('#my-wishlist-content');
    const myWishlistMmodal = $('#my-wishlist-modal');
    const mainContent = $('#MainContent');

    const utilityBar = $('.utility-bar__grid');

    if (utilityBar.length > 0) {
      const rightMenu = $('<div>').attr('id', 'right-menu').addClass('right-menu');
      appendMenuItem(rightMenu, 'My Account');
      appendMenuItem(rightMenu, 'My Wishlist');
      utilityBar.append(rightMenu);
    }

    if (shopName !== '' && shopEmail !== '') {
      getStore();
    }

    const wishlistData = getLocalStorage('wishlist');

    // Event listener for my-account-menu click
    $('#my-account-menu').on('click', function () {
      window.location.href = customerId === '' ? redirectToLogin : '/account/';
    });

    // Function to append menu item
    function appendMenuItem(parent, text) {
      const menuItem = $('<div>')
        .text(text)
        .attr('id', text.toLowerCase().replace(/\s+/g, '-') + '-menu')
        .addClass('right-menu');
      parent.append(menuItem);
    }

    async function injectDropdown(parent, text) {
      // for dropdown wishlist form
      const container = document.getElementById(`${parent}-container`);
      if (container) {
        const a = document.createElement('A');
        if (parent === 'wishlist') {
          if (text?._id) {
            a.textContent = text.name;
            a.setAttribute('data-id', text._id);
          } else {
            a.textContent = text;
          }
        } else {
          a.textContent = text;
        }
        const content = container.querySelector('.dropdown-content');
        content.insertBefore(a, content.firstChild);
      }
    }

    async function resetDropdown(parent) {
      const container = document.getElementById(`${parent}-container`);
      const content = container.querySelector('.dropdown-content');
      if (content) {
        const aElements = content.querySelectorAll('a');
        aElements.forEach((aElement) => {
          aElement.remove();
        });
      }
    }

    const createAddForm = (isWishlist = true) => {
      const modal = $(`
              <div class="modal" style="display: block">
                  <div class="modal-content p-5 modal-center m-auto" style="width: 430px">
                      <div class="modal-body">
                          <div class="block relative">
                              <h4 class="h4 m-0 w-90 title font-bold">
                                  Add a New ${isWishlist ? 'Wishlist' : 'Capsule'}
                              </h4>
                              <div class="top-0 right-0 absolute cursor-pointer btn-close">
                                  ${icons.close}
                              </div>
                          </div>
                          <div class="mt-5">
                              <label>${isWishlist ? 'Wishlist' : 'Capsule'}  Name</label>
                              <input type="text" class="mt-3 px-2 w-full" placeHolder="Enter ${isWishlist ? 'wishlist' : 'capsule'
        }  name...">
                              <button id="btn-wishlist-save" class="mt-8 btn-black text-white p-2">SAVE</button>
                          </div>
                      </div>
                  </div>
              </div>`);
      return modal;
    };

    const createWishlistForm = () => {
      const wishlistData = getLocalStorage('wishlist');
      const capsuleName = getLocalStorage('capsule-unique-names');
      const modal = $(`<div class="modal wishlist-modal" style="display: block">
              <div id="wishlist-modal-dialog">
                  <div class="flex">
                      ${product.image.size > 0
          ? `<img src="${product.image.src[0]}" alt="${product.title}" width="64">`
          : ''
        }
                      <div class="block px-3 relative w-full">
                          <h4 class="h4 m-0 w-90">
                              ${product.title}
                          </h4>
                          <p class="m-0">Size</p>
                          <select name="size" id="size" class="bg-none">
                          </select>
                          <div class="btn-close top-0 right-0 absolute cursor-pointer">${icons.close}</div>
                      </div>
                  </div>

                  <p>Add to Wishlist</p>
                  <div class="flex mt-3">
                      <div class="bullet rounded-full">
                          <div class="text-center w-full">
                              <span class="text-center w-full">WL</span>
                          </div>
                      </div>
                      <div class="ml-3 w-full flex flex-wrap align-center">
                          <div class="select-botton-container w-full relative">
                              <div id="wishlist-container" class="dropdown w-full">
                                  <button class="dropbtn drop-wishlist bg-none no-border text-left">
                                      <label>Wishlist</label>
                                      <div class="chevron">${icons.chevronUp}</div>
                                      <span>No wishlist selected</span>
                                  </button>
                                  <input type="hidden" id="wishlistId" value="">
                                  <div class="dropdown-content w-full">
                                      ${wishlistData
          .map((item) => `<a data-id="${item._id}">${item.name}</a>`)
          .join('')}
                                      <div class="p-5">
                                        <div class="btn-create-new cursor-pointer">CREATE NEW WISHLIST</div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div class="flex mt-3">
                      <div class="bullet rounded-full">
                          <div class="text-center w-full flex">${icons.tag}
                          </div>
                      </div>
                      <div class="ml-3 w-full flex flex-wrap align-center">
                          <div class="select-botton-container w-full relative">
                              <div id="capsule-container" class="dropdown w-full">
                                  <button class="dropbtn drop-capsule bg-none no-border text-left">
                                      <label>Capsule</label>
                                      <div class="chevron">${icons.chevronUp}</div>
                                      <span>No capsule selected</span>
                                  </button>
                                  <div class="dropdown-content dropdown-content-capsule w-full">
                                      ${capsuleName
          .filter((item) => item.trim() !== '' && item.trim() !== 'Uncategorized')
          .map((item) => `<a>${item}</a>`)
          .join('')}
                                      <div class="p-5">
                                        <div class="btn-create-new cursor-pointer">CREATE NEW CAPSULE</div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <p class="m-0 mt-8">Add a Comment</p>
                  <input type="text" id="txtComment" class="h64px w-full" name="txtComment">
                  <div class="submit-comment">
                      <button id="btn-create-wishlist" class="mt-8 text-white p-2">ADD TO WISHLIST</button>
                  </div>

              </div>
          </div>`);

      return modal;
    };

    function openWishlistForm() {
      const cwf = createWishlistForm().appendTo('body');
      cwf.find('.btn-close').on('click', () => cwf.remove());
      const params = new URLSearchParams(window.location.search);

      if (params.has('variant')) {
        const variantDetail = variants.find((e) => e.id === Number(params.get('variant')));
        if (variantDetail) {
          productSize = variantDetail.title;
          productVariant = variantDetail.id;
        }
      }

      cwf.find('#size').empty();
      variants.forEach(function (variant) {
        const option = document.createElement('option');
        option.value = variant.title;
        option.text = variant.title;
        option.setAttribute('data-variant-id', variant.id);

        if (variant.id === productVariant) option.selected = true;
        cwf.find('#size').append(option);
      });

      cwf.find('#size').on('change', function () {
        const productSize = $(this).val();
        const productVariant = $(this).find(':selected').data('variant-id');
        console.log('info =>', {
          productSize: productSize,
          productVariant: productVariant,
        });
      });

      const cWishlist = cwf.find('#wishlist-container');
      const dropWishlist = cWishlist.find('.dropbtn');
      const dcWishlist = cWishlist.find('.dropdown-content');

      const cCapsule = cwf.find('#capsule-container');
      const dropCapsule = cCapsule.find('.dropbtn');
      const dcCapsule = cCapsule.find('.dropdown-content');

      dropWishlist.on('click', (event) => {
        event.stopPropagation();
        if (dcCapsule.is(':visible')) dcCapsule.hide();
        dcWishlist.toggle();
      });

      dcWishlist.on('click', function (event) {
        const target = $(event.target);
        const isAnchor = target.is('a');
        const isDiv = target.is('div');

        if (isAnchor) {
          const optionText = target.text();
          const dataId = target.data('id') || '';
          $('#wishlistId').val(dataId);
          dropWishlist.find('span').text(optionText);
          dcWishlist.hide();
        } else if (isDiv) {
          const awf = createAddForm().appendTo('body');
          awf.find('.btn-close').on('click', () => awf.remove());
          awf.find('button').on('click', () => {
            const text = awf.find("input[type='text']").first();
            if (text.val().trim()) {
              dropWishlist.find('span').text(text.val().trim());
              cWishlist.find('.dropdown-content').prepend($(`<a>${text.val().trim()}</a>`));
              awf.remove();
            } else {
              text.addClass('warning');
            }
          });

          //addWishlistModal.style.display = 'block';
        }

        if (!target.is('.dropbtn')) dcWishlist.hide();
      });

      //dropCapsule.on('click', () => dcCapsule.toggle());
      dropCapsule.on('click', (event) => {
        event.stopPropagation();
        if (dcWishlist.is(':visible')) dcWishlist.hide();
        dcCapsule.toggle();
      });
      // Click event handler for the document
      $(document).on('click', (event) => {
        if (dcWishlist.is(':visible')) dcWishlist.hide();
        if (dcCapsule.is(':visible')) dcCapsule.hide();
      });

      dcCapsule.on('click', function (event) {
        const target = $(event.target);
        const isAnchor = target.is('a');
        const isDiv = target.is('div');

        if (isAnchor) {
          const optionText = target.text();
          dropCapsule.find('span').text(optionText);
          dcCapsule.hide();
        } else if (isDiv) {
          const awf = createAddForm(false).appendTo('body');
          awf.find('.btn-close').on('click', () => awf.remove());
          awf.find('button').on('click', () => {
            const text = awf.find("input[type='text']").first();
            if (text.val().trim()) {
              dropCapsule.find('span').text(text.val().trim());
              cCapsule.find('.dropdown-content').prepend($(`<a>${text.val().trim()}</a>`));
              awf.remove();
            } else {
              text.addClass('warning');
            }
          });
        }

        if (!target.is('.dropbtn')) dcCapsule.hide();
      });

      cwf.find('#btn-create-wishlist').on('click', async function (event) {
        const wishlistId = getElementValue('wishlistId');
        let productPriceCurrency = '';
        const priceItemElement = document.querySelector('.price-item');
        if (priceItemElement && priceItemElement.outerText) productPriceCurrency = priceItemElement.outerText.trim();
        if (productSize === 'Default Title') productSize = '--';

        const selectedVariantId = cwf.find('#size').find(':selected').data('variant-id');
        const selectedVariant = product.variants.find((v, i) => {
          return selectedVariantId !== null ? v.id === selectedVariantId : i === 0;
        });
        const productSku = selectedVariant.sku ?? '';
        const productArticle = product.article.map((a) => a.title).join(', ');

        const comments = cwf.find('#txtComment').val();

        const name =
          dropWishlist.find('span').text() === 'No wishlist selected' ? '' : dropWishlist.find('span').text();
        const capsuleName =
          dropCapsule.find('span').text() === 'No capsule selected' ? '' : dropCapsule.find('span').text();

        const confirmImageUrl = (URL) => {
          return URL.substring(0, 2) === '//'
            ? `https:` + product.image.src[0]
            : URL.indexOf('http') < 0
              ? `https://` + product.image.src[0]
              : product.image.src[0].replace('http:', 'https:');
        };

        const obj = {
          store: store,
          name,
          products: [
            {
              productId: product.id,
              productName: product.title,
              productPrice: product.price,
              productImage: confirmImageUrl(product.image.src[0]),
              productUrl: product.url,
              productPriceCurrency,
              productSku,
              productArticle,
              productVariant: selectedVariantId,
              productSize,
              capsule: {
                name: capsuleName,
              },
            },
          ],
          comments: comments
            ? [
              {
                comment: comments,
                commentedBy: {
                  first_name,
                  last_name,
                  email,
                  userId,
                },
              },
            ]
            : undefined,
          createdBy: {
            first_name,
            last_name,
            email,
            userId,
          },
          lastAdded: {
            by: {
              first_name,
              last_name,
              email,
              userId,
            },
          },
          lastUpdated: {
            by: {
              first_name,
              last_name,
              email,
              userId,
            },
          },
        };

        const requestOptions = {
          method: 'POST',
          body: JSON.stringify(obj),
          redirect: 'follow',
        };
        try {
          let isTrue = 0;
          if (obj.name === '') {
            cWishlist.addClass('warning');
            isTrue++;
          } else {
            cWishlist.removeClass('warning');
          }

          if (isTrue > 0) return;
          cwf.find('.submit-comment button').css({ display: 'none' });
          loader = await renderLoader('0');
          cwf.find('.submit-comment').append(loader);

          let response;
          if (wishlistId) {
            let productObj = obj;
            delete productObj.comments;
            productObj.products[0].comments = comments
              ? [
                {
                  comment: comments,
                  commentedBy: {
                    first_name,
                    last_name,
                    email,
                    userId,
                  },
                },
              ]
              : undefined;

            const productData = {
              method: 'POST',
              // headers: myHeaders,
              body: JSON.stringify(productObj),
              redirect: 'follow',
            };
            response = await fetch(appUrl + '/wishlist/' + wishlistId + '/product', productData);
          } else {
            response = await fetch(appUrl + '/wishlist', requestOptions);
          }

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const result = await response.json();

          //start reload cookie
          getWishlist(userId, store);
          getProductCapsules(userId, store);
          //end reload cookie

          const notif = createNotification(`
                      <div class="flex">
                      ${product.image.size > 0
              ? `<img src="${product.image.src[0]}" alt="${product.title}" width="64">`
              : ''
            }

                          <div class="block px-3 relative w-full">
                              <p>
                                  <span class="font-bold">
                                      ${product.title}
                                  </span>
                                  <span id="sizeAdd" class="font-bold"> - Size : ${productSize}</span>
                                  has been added to<span id="wishlistAdd" class="font-bold"> ${name}</span> successfully
                              </p>
                          </div>
                      </div>`);

          await Promise.all([
            new Promise((resolve) => {
              setTimeout(() => {
                cwf.find('.submit-comment button').css({ display: 'block' });
                loader.remove();
                deleteCookie('wishlistId');
              }, 2000);
            }),
            new Promise((resolve) => {
              setTimeout(() => {
                cwf.remove();
                $('body').append(notif);
                notif.find('.modal-content')[0].classList.add('animate__animated', 'animate__slideInDown');
                notif.find('#btn-close').on('click', function () {
                  notif.remove();
                  resolve();
                });
              }, 2000);
            }),
            new Promise((resolve) => {
              setTimeout(() => {
                notif.remove();
                resolve();
              }, 3000);
            }),
          ]);
        } catch (error) {
          console.error('Error creating wishlist:', error);
        }
      });
    }

    async function getStore() {
      try {
        const initWishlist = setInterval(() => {
          const res = JSON.parse(getCookie('storeSetting'));
          // if (res) {
          // setCookie("storeSetting", JSON.stringify(res), 1);
          // setLocalStorage("storeSetting", res);
          // }
          let wishlistButton = $('#wishlist-button');

          if (res) {
            if ([1, 3, 5].includes(res?.buttonSettings?.type)) {
              const fillColor = [3, 5].includes(res?.buttonSettings?.type) ? res?.buttonSettings?.colorBeforeAdded : res?.buttonSettings?.colorAfterAdded;
              wishlistButton.html(
                '<svg style="fill: ' + fillColor +
                  '" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7" /></svg>'
              );
            }

            if ([1, 2, 3, 4, 5].includes(res?.buttonSettings?.type)) {
              let btnLabel =
                res.buttonSettings.label === ""
                  ? "Add to Wishlist"
                  : res.buttonSettings.label;
              if(res?.buttonSettings?.type === 5) btnLabel = ""
              const divElement = $("<div>").html(btnLabel).css({
                fontSize: "14px",
                color: res.buttonSettings.colorAfterAdded,
              });
              wishlistButton.css({ 'padding-right': '15px !important' }).append(divElement);
              $('.wishlist-form').css({
                display: 'inline-block',
                position: 'unset',
                marginTop: '1.5rem',
              });
            }
            if ([1, 2].includes(res.buttonSettings.type)) {
              wishlistButton.css({
                padding: res.buttonSettings.type === 1 ? "4px 16px" : "14px 8px",
                background: res.buttonSettings.colorBeforeAdded,
                color: res.buttonSettings.colorAfterAdded,
                borderRadius: '4px',
              });
            }
          }

          // wishlistButton.on('click', customerId === '' ? redirectToLogin : openWishlistForm);
          wishlistButton.on('click', function () {
            if (customerId !== '' && storeDomain !== '') {
              openWishlistForm();
            } else {
              setLocalStorage('productUrl',window.location.href)
              redirectToLogin();
            }
          });

          if (res && res?.launcherSettings?.wishlistDisplayed.toLowerCase() === 'with icon') {
            newHTML = `
                          <a style="margin-left: 1.2rem" class="header__icon header__icon--wishlist link focus-inset" id="my-wishlist-menu">
                          <svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 512 512" style="font-size: 12px">
                              <path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7">
                              </path>
                          </svg>
                          <span class="visually-hidden">Wishlist</span>
                          </a>
                      `;
          } else {
            newHTML = `
                          <a style="margin-left: 1.2rem" class="header__icon header__icon--wishlist link focus-inset" id="my-wishlist-menu">
                          <span style="white-space: nowrap; margin-left:25px;" class="">${res?.launcherSettings?.name === '' ? 'Wishlist' : res?.launcherSettings?.name
              }</span>
                          </a>
                      `;
          }

          if(res?.launcherSettings?.navbar) {
            const headerIcons = document.querySelector('.header__icons');
            if (headerIcons) {
              headerIcons.insertAdjacentHTML("beforeend", newHTML);
              // Event listener for my-wishlist-menu click
              $('#my-wishlist-menu').on('click', function () {
                if (customerId !== '' && storeDomain !== '') {
                  openWishlistList();
                } else {
                  redirectToLogin();
                }
              });
              clearInterval(initWishlist);
            }
          }
          if(res?.launcherSettings?.myAccount) {
            const AccountMenu = document.querySelector(".account h1");
            if(AccountMenu) {
              const accountMenuHTML = newHTML.replace(
                'style="margin-left: 1.2rem"', 'style="font-size: calc(var(--font-heading-scale) * 3rem); justify-content: left; "'
                );
              AccountMenu.insertAdjacentHTML("beforeend", accountMenuHTML);
              const AccountSpan =  AccountMenu.querySelector("#my-wishlist-menu span");
              if(AccountSpan) AccountSpan.style.marginLeft = '0px'
              const AccountSvg =  AccountMenu.querySelector("#my-wishlist-menu svg");
              if(AccountSvg) AccountSvg.style.width="unset"

              $('.account h1 #my-wishlist-menu').on('click', function () {
                if (customerId !== '' && storeDomain !== '') {
                  openWishlistList();
                } else {
                  redirectToLogin();
                }
              })
              clearInterval(initWishlist);
            }
          }
        }, 500);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    async function getProductCapsules(userId, store) {
      try {
        const requestOptions = {
          url: `${appUrl}/wishlist/capsule?userId=${userId}&store=${store}`,
          method: 'GET',
          timeout: 0,
        };
        return new Promise((resolve, reject) => {
          $.ajax(requestOptions).done(function (response) {
            const res = response.data;
            const uniqueNames = new Set();
            res.forEach((item) => {
              uniqueNames.add(item.capsule.name);
            });
            const distinctNames = Array.from(uniqueNames);
            setLocalStorage('capsule-unique-names', distinctNames);

            setCookie('capsule-unique-names', JSON.stringify(distinctNames), 1);
            resolve({
              success: true,
              data: response.data,
              uniqueNames: distinctNames,
            });
          });
        });
      } catch (error) {
        console.error('Error:', error);
      }
    }

    function copyLink(data) {
      // Create a temporary input element
      var tempInput = document.createElement('input');

      // Set the value to the data
      tempInput.value = data;

      // Append the input element to the body
      document.body.appendChild(tempInput);

      // Select the text in the input
      tempInput.select();
      document.execCommand('copy');

      // Remove the temporary input element
      document.body.removeChild(tempInput);
    }

    if (currentUrl.includes('/account')) {
      if (getLocalStorage('shareLink')) {
        const shareLink = getLocalStorage('shareLink');
        let queryParams = `https://${window.location.hostname}/pages/share-wishlist?id=${shareLink.id}`;
        if (shareLink.product_id) queryParams += `&product_id=${shareLink.product_id}`;
        window.location.href = queryParams;
        localStorage.removeItem('shareLink');
      } else {
        if (userId && storeDomain) getWishlist(userId, storeDomain);
      }
      if (customerId !== '' && storeDomain !== '') {
        const productUrl = getLocalStorage('productUrl');
        if (productUrl) {
          window.location.href = productUrl;
          localStorage.removeItem('productUrl');
        }
      }
    }

    if (currentUrl.includes('/products/')) {
      const productTitle = $('.product__title');

      const sizeSelect = $('#size');

      variants = product.variants;

      // Add a change event listener to the radio buttons
      document.addEventListener('DOMContentLoaded', function () {
        const variantRadios = document.querySelectorAll('input[name="Size"]');
        console.log('variantRadios =>', variantRadios);
        variantRadios.forEach(function (radio) {
          radio.addEventListener('change', function () {
            // Check if the radio button is checked
            if (radio.checked) {
              // Get the selected variant size value
              var selectedVariantSize = radio.value;
              var selectedVariant = variants.find(function (variant) {
                return variant.title === selectedVariantSize;
              });
              console.log('selectedVariant w =>', selectedVariant);

              if (selectedVariant) {
                var selectedVariantId = selectedVariant.id;
                console.log('selectedVariantId :', selectedVariantId);
                productSize = selectedVariantSize;
                productVariant = selectedVariantId;

                document.getElementById('productSize').value = selectedVariantSize;
                document.getElementById('productVariant').value = selectedVariantId;
                sizeSelect.innerHTML = '';
                variants.forEach(function (variant) {
                  var option = document.createElement('option');
                  option.value = variant.title;
                  option.text = variant.title;
                  option.setAttribute('data-variant-id', variant.id);

                  // Set the selected attribute based on the value
                  if (variant.title === selectedVariantSize) {
                    option.selected = true;
                  }

                  sizeSelect.append(option);
                });
              }
            }
          });
        });
      });

      // Create a new div element with the wishlist-form HTML
      const wishlistForm = document.createElement('div');
      wishlistForm.innerHTML = `<div class="wishlist-form"><div id="wishlist-button" class="wishlist-button cursor-pointer"></div></div>`;
      // Append the wishlistForm div to the productTitle div
      if (product.available === 'true') if (productTitle) productTitle.append(wishlistForm);

      //if (customerId !== "" && storeDomain !== "" && !getLocalStorage('wishlist')) {
      if (customerId !== '' && storeDomain !== '') {
        const gw = await getWishlist(customerId, storeDomain);
        if (gw && gw.success) {
          gw?.simplified.forEach((e) => {
            if (e.name !== '') injectDropdown('wishlist', e);
          });
        }
      }
      //if (customerId !== "" && storeDomain !== "" && !getLocalStorage('capsule-unique-names')) {
      if (customerId !== '' && storeDomain !== '') {
        const gpc = await getProductCapsules(customerId, storeDomain);
        if (gpc && gpc.success) {
          gpc?.uniqueNames.forEach((e) => {
            if (e.name !== '') injectDropdown('capsule', e);
          });
        }
      }
    }

    function redirectToLogin() {
      // openLoginModal();
      window.location.href = '/account/login';
    }

    function showModal() {
      wishlistModal.style.display = 'block';
      productColumnSticky.style.position = 'relative';
      productColumnSticky.style.zIndex = -1;

      if (getCookie('wishlistId')) {
        const id = getCookie('wishlistId');
        const wishlistDetail = wishlistData.find((e) => e._id == id);
        console.log('wishlistDetail =>', wishlistDetail);
        document.getElementById('wishlistId').value = id ? id : '';
        dropWishlist.querySelector('span').textContent = wishlistDetail?.name;
      }
    }
    function addBodyStyling() {
      const mainContent = $('#MainContent');
      mainContent.css({
        position: 'relative',
        zIndex: -1,
      });
    }
    function delBodyStyling() {
      const mainContent = $('#MainContent');
      mainContent.css({
        position: 'sticky',
        zIndex: 2,
      });
    }

    function closeModal() {
      wishlistModal.style.display = 'none';
      productColumnSticky.style.position = 'sticky';
      productColumnSticky.style.zIndex = 2;
    }

    function closeAddNewWishlist() {
      addWishlistModal.style.display = 'none';
    }

    function closeAddNewCapsule() {
      // capsuleModal.style.display = 'none';
      capsuleModal.css({ display: 'none' });
      productColumnSticky.style.position = 'relative';
      productColumnSticky.style.zIndex = -1;
    }

    // // -- start wislist list --
    const openWishlistList = async () => {
      console.log('openWishlistList');
      const cartData = getLocalStorage('cartData');
      if (cartData) {
        const gw = await getWishlist(userId, store);
        if (gw) localStorage.removeItem('cartData');
      }

      const wishlistData = getLocalStorage('wishlist');
      const wishlistList = createWishlistList();
      $('body').append(wishlistList);

      const closeWishlistBtn = wishlistList.find('#btn-close-my-wishlist');
      closeWishlistBtn.on('click', () => wishlistList.remove());

      const myWishlistContent = wishlistList.find('#my-wishlist-content');
      const myWishlistDetail = wishlistList.find('#my-wishlist-detail');

      renderWishlistContent(myWishlistContent);

      const enptyWishlist = wishlistList.find('.enpty-wishlist');
      if (enptyWishlist.length > 0) {
        enptyWishlist.find('button').on('click', () => {
          window.location.href = '/collections/all';
        });
      }

      myWishlistDetail.addClass('hidden');

      // Dropdown wishlist
      const cWishlist = wishlistList.find('#dropdown-wishlist');
      const dWishlist = cWishlist.find('.dropbtn');
      const dcWishlist = cWishlist.find('.dropdown-content');

      dcWishlist.on('input', '#wishlist-search', function () {
        const searchText = $(this).val().toLowerCase();
        filterDropdownContent('.dropdown-content a', searchText);
      });

      // Dropdown capsule
      const cCapsule = wishlistList.find('#dropdown-capsule');
      const dCapsule = cCapsule.find('.dropbtn');
      const dcCapsule = cCapsule.find('.dropdown-content');

      setupDropdownClickEvent(dWishlist, dcWishlist, dcCapsule, showWishlistDetail);
      setupDropdownClickEvent(dCapsule, dcCapsule, dcWishlist, filterProductsByCapsule);

      myWishlistContent.on('click', '.wishlist-item .item, .wishlist-item .name', function (event) {
        const wishlistId = $(this).closest('.wishlist-item').attr('data-id');
        if (wishlistId) {
          myWishlistContent.addClass('hidden');
          myWishlistDetail.removeClass('hidden');
          setupDropdownContent(dcWishlist, wishlistData, true);
          showWishlistDetail(wishlistId);
        }
      });
      wishlistList.show();

      const cShare = myWishlistContent.find('.wishlist-content .wishlist-item .btn-share');
      cShare.on('click', async (event) => {
        const wishlistId = $(event.currentTarget).closest('.wishlist-item').attr('data-id');
        await shareWishlist(wishlistId);
      });

      $(document).on('click', (event) => {
        if (dcWishlist.is(':visible')) dcWishlist.hide();
        if (dcCapsule.is(':visible')) dcCapsule.hide();
      });
    };

    const createWishlistList = () => {
      const wishlistList = $(`<div id="my-wishlist-modal" class="modal">
              <div id="modal-dialog" class="my-wishlist-modal p-0">
                  <div class="flex justify-between px-5 bar w-full">
                      <div class="flex align-center">
                          <h2 class="font-bold">My Wishlist</h2>
                          <div class="profile rounded-full">${icons.user}</div>
                          <div class="flex">${email}</div>
                      </div>

                      <div id="btn-close-my-wishlist" class="btn-close cursor-pointer flex justify-end align-center">${icons.close
        }</div>
                  </div>
                  <div id="my-wishlist-detail" class="my-wishlist-detail">
                      <div class="flex justify-between w-full sub-heading p-5">
                          <div class="flex align-center">
                              <div class="p-2 flex wishlist-icon">
                              </div>
                              <div class="p-2">
                                  <div class="select-botton-container w-full relative">
                                      <div id="dropdown-wishlist" class="dropdown w-full pr-12">
                                          <button class="dropbtn drop-wishlist bg-none no-border text-left">
                                              <label>Wishlist</label>
                                              <div class="chevron right-0">
                                                  ${icons.chevronDown}
                                              </div>
                                              <span>Rose Wishlist (13)</span>
                                          </button>
                                          <input type="hidden" id="wishlistId" value="">
                                          <div class="dropdown-content w-full"></div>
                                      </div>
                                  </div>
                              </div>
                              <div class="bullet rounded-full">
                                  ${icons.user}
                              </div>
                              <div class="p-2">
                                  <div class="select-botton-container w-full relative">
                                      <div id="dropdown-capsule" class="dropdown w-full pr-12">
                                          <button class="dropbtn drop-capsule bg-none no-border text-left">
                                              <label>Capsule</label>
                                              <div class="chevron right-0">
                                                  ${icons.chevronDown}
                                              </div>
                                              <span>Select</span>
                                          </button>
                                          <div class="dropdown-content w-full"></div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          <div class="flex justify-end align-center gap-4">
                              <div class="btn btn-share bg-white">
                                  <div class="share flex">
                                      ${icons.share}
                                  </div>
                                  SHARE</div>
                              <div class="btn btn-add-to-cart bg-black text-white">
                                  <div class="bag flex">
                                      ${icons.shoppingBag}
                                  </div>
                                  ADD ALL TO CART</div>
                              <div class="select-botton-container min-w-0 relative manage-wishlist">
                                  <div class="btn border-0">Manage Wishlist</div>
                                  <div id="manage-wishlist-content" class="dropdown-content manage-wishlist-content w-full">
                                      <a data-id="Add Item">
                                          <div class="bullet rounded-full">${icons.dres}</div>
                                          Add Item
                                      </a>
                                      <a data-id="Duplicate Wishlist">
                                          <div class="bullet rounded-full">${icons.duplicate}</div>
                                          Duplicate Wishlist
                                      </a>
                                      <a data-id="Remove Wishlist" class="remove">
                                          <div class="bullet rounded-full">${icons.remove}</div>
                                          Remove Wishlist
                                      </a>
                                  </div>
                              </div>

                          </div>
                      </div>
                      <div id="my-wishlist-detail-content" class="p-5 detail-content">
                      </div>
                      <div class="comment">
                          <div class="flex justify-between w-full">
                              <div class="flex comments-count">
                                  <p class="font-bold">Comments (0)</p>
                              </div>
                              <div class="flex justify-end gap-8 flex-wrap align-center icon">
                                  <div class="flex flex-wrap align-center btn-chevron cursor-pointer open-expand">
                                      ${icons.chevronDown}
                                  </div>
                                  <div class="flex flex-wrap align-center cursor-pointer expand-comment">
                                      ${icons.expand}
                                  </div>
                              </div>
                          </div>

                          <div id="list-comment">
                          </div>

                          <div class="flex justify-between w-full gap-8">
                              <div class="flex">
                                  <div class="bullet rounded-full">
                                      <div class="text-center w-full">
                                          <span class="text-center w-full">${getInitials(
          `${first_name} ${last_name}`
        )}</span>
                                      </div>
                                  </div>
                              </div>
                              <div class="flex w-full mb-5">
                                  <div class="input-group w-full">
                                      <textarea id="wishlistComment" placeholder="Enter your comment here..." required class="w-full" ></textarea>
                                      <div class="submit-comment">
                                          <button disabled id="submitComment" type="button">POST</button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          <div class="mt-5 hidden">
                              <span class="font-bold">*Enter </span>to Send
                              <span class="font-bold">Shift + Enter</span> to Add a New Line
                          </div>

                      </div>
                  </div>
                  <div id="my-wishlist-content" class="p-5">
                  </div>
              </div>
          </div>
          `);

      //wishlistList.find('.profile').html(icons.user);
      return wishlistList;
    };

    const createDuplicate = (name = '') => {
      const modal = $(`
              <div id="duplicate-modal" class="modal" style="display: block">
                  <div class="modal-content bg-white p-5" style="width: 430px">
                      <div class="modal-body">
                          <div class="block relative">
                              <h4 class="h4 m-0 w-90 title font-bold">
                                  Duplicate Wishlist
                              </h4>
                              <div id="btn-close" class="top-0 right-0 absolute cursor-pointer btn-close">
                                  ${icons.close}
                              </div>
                          </div>

                          <div class="">
                              <label class="px-0 label">Wishlist Name</label>
                              <input type="text" id="txtWishlist" required class="w-full" value="${name} Copy" />
                          </div>
                          <div class="confirm flex gap-4 w-1/2 mx-auto mt-5">
                              <button id="btn-cancel" class="mt-8 py-3 px-5">CANCEL</button>
                              <button id="btn-save" class="mt-8  py-3 btn-black px-5">SAVE</button>
                          </div>
                      </div>
                  </div>
              </div>
          `);
      return modal;
    };

    const createShare = (name = '') => {
      const modal = $(`
              <div id="share-modal" class="modal" style="display: block">
                  <div class="modal-content bg-white p-5" style="width: 430px">
                      <div class="modal-body">
                          <div class="block relative">
                              <p class="h4 m-0 w-90 title font-bold">
                                  Share Wishlist Via Email
                              </p>
                              <div id="btn-close" class="top-0 right-0 absolute cursor-pointer btn-close">
                                  ${icons.close}
                              </div>
                          </div>

                          <div class="mt-5">
                              <label class="px-0 label">Sender Name</label>
                              <input type="text" id="txtSenderr" required class="w-full" value="${name}" />
                          </div>
                          <div class="mt-5">
                              <label class="px-0 label">Recipient Email Address*</label>
                              <input type="text" id="txtRecipient" required class="w-full" placeHolder="Enter recipient email address..." />
                          </div>
                          <div class="mt-5">
                              <label class="px-0 label">Message</label>
                              <textarea id="txtMessage" placeholder="Enter your message..." required class="w-full"></textarea>
                          </div>
                          <div class="w-full mt-5">
                              <button id="btn-share" class="mt-8 py-3 btn-black px-5">SHARE WISHLIST</button>
                              <div class="loader"></div>
                          </div>
                          <hr class="my-12">
                          <div class="w-full text-center">
                              <label class="mx-0 label">Or Share Via</label>
                          </div>
                          <div class="w-full flex mt-5 justify-between social-media fill-black">
                              <div class="flex gap-2 flex-wrap align-center relative copy-link">
                                  ${icons.link}
                                  <label class="label">COPY LINK</label>
                                  <div id="copyLinkNotification">Copied!</div>
                               </div>
                              <div class="flex gap-2 flex-wrap align-center share-facebook">
                                  <label class="label">FACEBOOK</label>
                              </div>
                              <div class="flex gap-2 flex-wrap align-center share-twitter">
                                  <label class="label">TWITTER</label>
                              </div>
                          </div>

                      </div>
                  </div>
              </div>
          `);
      return modal;
    };

    const renderWishlistContent = (container) => {
      container.html('');
      //const wishlistData = JSON.parse(getCookie('wishlist'));
      const wishlistData = getLocalStorage('wishlist');
      if (wishlistData && wishlistData.length > 0) {
        let wishlistIndex = 0;
        wishlistData.forEach((item, index) => {
          wishlistIndex = renderWishlistItem(container, wishlistIndex, item);
        });
      } else {
        renderEmptyWishlist(container);
      }

      container.removeClass('hidden');
    };

    const renderWishlistItem = (container, wishlistIndex, item) => {
      const i = wishlistIndex + 1;
      let wishlistWrap;
      let storeDetails = getLocalStorage("storeSetting");

      if (i % 3 === 1) {
        wishlistIndex++;
        wishlistWrap = document.createElement('div');
        wishlistWrap.className = 'wishlist-content';
        wishlistWrap.innerHTML = `<div id="wrap-${wishlistIndex}" class="flex flex-wrap mx-auto gap-6 mt-5"></div>`;
        container.append(wishlistWrap);
      }

      wishlistWrap = document.getElementById(`wrap-${wishlistIndex}`);
      const productImage = [];
      let imageCount = 0;

      item.products.forEach((e) => {
        imageCount++;
        if (imageCount <= 3)
          productImage.push(`<img src="${e.productImage}" class="w-full h-full object-cover mb-4" />`);
      });

      const wishlistItemHTML = `
              <div class="wishlist-item bg-white m-4 p-4 shadow-md flex flex-col w-full h-full justify-center" data-id=${item._id
        }>
                  <div class="flex justify-between px-5 py-3 w-full mb-auto">
                      <div class="flex align-center">
                          <h6 class="name m-0 cursor-pointer">${item.name}</h6>
                      </div>

                      <div class="btn-share cursor-pointer flex justify-end align-center">
                          ${icons.share}
                      </div>
                  </div>
                  <div class="item cursor-pointer">
                      <div class="flex gap-4 my-auto item-${item.products.length <= 2 ? item.products.length : 3}">
                          ${productImage.join('')}
                      </div>
                      <div class="mt-5">
                        ${
                          storeDetails?.launcherSettings?.showNumber === "Yes"
                            ? `<p class="p-0 m-0 view">${item.products.length} product</p>`
                            : ''
                        }
                        <p class="p-0 m-0 view">VIEW LIST</p>
                      </div>
                  </div>
              </div>
          `;

      const div = document.createElement('div');
      div.classList.add('flex', 'w-full', 'md:w-1/3', 'mb-4');
      div.innerHTML = wishlistItemHTML;
      wishlistWrap.append(div);

      return wishlistIndex;
    };

    const renderEmptyWishlist = (container) => {
      container.html(`
              <div class="p-5 enpty-wishlist">
                  <div class="text-center">
                      <h1>Love It? Add To My Wishlist</h1>
                      <p>My Wishlist allows you to keep track of all of your favorites...</p>
                      <p>It's very easy, If you find an item you love, just click on the "heart" icon...</p>
                  </div>
                  <div class="btn">
                      <button>CONTINUE SHOPPING</button>
                      <button>SEE ALL CLOTHING</button>
                  </div>
              </div>
          `);
    };

    const setupDropdownClickEvent = (dropdown, dropdownContent, dropdownClose, callback) => {
      dropdown.on('click', (event) => {
        console.log('setupDropdownClickEvent =>');
        event.stopPropagation();
        if (dropdownClose.is(':visible')) dropdownClose.hide();
        dropdownContent.css('display', dropdownContent.css('display') === 'block' ? 'none' : 'block');
      });

      dropdownContent.on('click', (event) => {
        const dataId = event.target.getAttribute('data-id');
        if (event.target.tagName === 'A') {
          const optionText = event.target.textContent;
          callback(dataId);
          dropdown.find('span').text(optionText);
          dropdownContent.css('display', 'none');
        } else if (event.target.tagName === 'DIV') {
          //addWishlistModal.css('display', 'block');
          if (dataId === 'clear-selection') {
            dropdown.find('span').text('Select');
            dropdownContent.css('display', 'none');
          } else {
            addWishlistModal.style.display = 'block';
          }
        }
      });

      // Exclude input field from event propagation
      dropdownContent.on('click', 'input', (event) => {
        event.stopPropagation();
      });
    };

    const filterDropdownContent = (selector, searchText) => {
      $(selector).each(function () {
        const wishlistName = $(this).text().toLowerCase();
        wishlistName.includes(searchText) ? $(this).show() : $(this).hide();
      });
    };

    const setupDropdownContent = (dropdownContent, data, isWishlist = false) => {
      dropdownContent.html(
        isWishlist
          ? `
              <div class="search">
                  <label>Search Wishlist</label>
                  <div class="input-group">
                      <div class="icon">
                          ${icons.search}
                      </div>
                      <input id="wishlist-search" type="text" placeholder="Wishlist name...">
                  </div>
                  <label>Results</label>
              </div>
          `
          : ``
      );

      data.forEach((item) => {
        dropdownContent.append(
          isWishlist
            ? `
                  <a data-id="${item._id}">
                      <img src="${item.products.length > 0 ? item.products[0].productImage : ''}">
                      ${item.name} (${item.products.length})
                  </a>
              `
            : `
                  <a data-id="${item}">${item}</a>
              `
        );
      });
    };

    function filterProductsByCapsule(selectedCapsule) {
      const wishlistContent = document.getElementById('my-wishlist-detail-content');
      const capsules = wishlistContent.querySelectorAll('.bar');

      const dCapsule = $('#dropdown-capsule');
      const dropdownContent = dCapsule.find('.dropdown-content');

      const capsuleData = JSON.parse(getCookie('capsuleData'));

      dropdownContent.innerHTML = ``;
      if (capsuleData) setupDropdownContent(dropdownContent, capsuleData);

      const d = document.createElement('DIV');
      d.classList.add('clear');
      d.innerHTML = `
              <div data-id="clear-selection" class="flex gap-4 clear-selection">
                  <div class="icon">${icons.close}</div>
                  Clear Selection
              </div>
          `;
      dropdownContent.prepend(d);

      dropdownContent.on('click', function (event) {
        if (event.target.tagName === 'A') {
          const selectedCapsule = event.target.getAttribute('data-id');
          filterProductsByCapsule(selectedCapsule);
        } else {
          filterProductsByCapsule();
          dropdownContent.find('.clear').remove();
        }
      });

      capsules.forEach((capsule) => {
        const capsuleName = capsule.textContent.trim();
        const capsuleContent = capsule.nextElementSibling;
        if (selectedCapsule) {
          if (capsuleName === selectedCapsule) {
            capsule.style.display = 'block'; // Show the selected capsule title
            capsuleContent.style.display = 'block'; // Show the selected capsule content
          } else {
            capsule.style.display = 'none'; // Hide other capsules
            capsuleContent.style.display = 'none'; // Hide other capsules' content
          }
        } else {
          capsule.style.display = '';
          capsuleContent.style.display = '';
        }
      });
    }

    const showWishlistDetail = (wishlistId) => {
      const cWishlist = $('#dropdown-wishlist');
      const dWishlist = cWishlist.find('.dropbtn');
      const dcWishlist = cWishlist.find('.dropdown-content');

      const cCapsule = $('#dropdown-capsule');
      const dcCapsule = cCapsule.find('.dropdown-content');

      const wishlistData = getLocalStorage('wishlist');
      const wishlistDetail = wishlistData.find((e) => e._id == wishlistId);
      console.log('wishlistDetail =>', wishlistDetail);
      const myWishlistDetail = $('#my-wishlist-detail');

      if (wishlistDetail) {
        dWishlist.find('span').text(`${wishlistDetail.name} (${wishlistDetail.products.length})`);
        const wishlistIcon = $('.wishlist-icon');

        if (wishlistIcon.length > 0) {
          wishlistIcon.html(`<img src="${wishlistDetail.products[0].productImage}" height="48" />`);

          const commentsCount = wishlistDetail.comments.length > 0 ? wishlistDetail.comments.length : 0;
          myWishlistDetail.find('.comments-count P').text(`Comments (${commentsCount})`);
          myWishlistDetail.on('input', '#wishlistComment', function () {
            const comment = $(this).val().trim();
            myWishlistDetail.find('#submitComment').prop('disabled', comment.length >= 1 ? false : true);
          });
        }
      }

      const groupedData = groupByProperty(wishlistDetail.products, 'capsule');
      const capsuleData = Object.keys(groupedData);
      if (capsuleData) {
        setCookie('capsuleData', JSON.stringify(capsuleData), 1);
        setupDropdownContent(dcCapsule, capsuleData);
      }

      const dtlContent = $('#my-wishlist-detail-content');
      dtlContent.html('');

      let idx = 0;

      for (const category in groupedData) {
        if (Object.hasOwnProperty.call(groupedData, category)) {
          idx++;
          const d = document.createElement('DIV');
          d.classList.add('bar');
          d.innerHTML = category;
          dtlContent.append(d);

          const wrap = $(`
                      <div class="wishlist-content">
                          <div id="wrap-dtl-${idx}" class="flex flex-wrap mx-auto gap-6 mt-5 mb-5"></div>
                      </div>`);

          groupedData[category].forEach((product) => {
            const item = $(`
                          <div class="flex item mb-4">
                              <div class="wishlist-item bg-white shadow-md flex flex-col w-full h-full justify-center mb-0" data-id="${product._id
              }" data-product-id="${product.productId}">
                                  <div class="p-3">
                                      <div class="flex justify-between pb-3 w-full mb-auto">
                                          <div class="btn-close remove-product cursor-pointer ml-auto">
                                              ${icons.close}
                                          </div>
                                      </div>

                                      <div class="flex gap-4 my-auto">
                                          <img src="${product.productImage}"
                                              class="w-full h-full object-cover mb-4">
                                      </div>
                                      <div class="mt-8">
                                          <p class="p-0 m-0 view">${product.productName}</p>
                                          <p class="p-0 m-0 view">${product.productPriceCurrency !== ''
                ? product.productPriceCurrency
                : product.productPrice
              }</p>
                                      </div>
                                  </div>
                                  <div class="select-size">
                                      <p class="">SELECT SIZE</p>
                                  </div>
                              </div>
                          </div>
                      `);

            wrap.find(`#wrap-dtl-${idx}`).append(item);
          });

          dtlContent.append(wrap);
        }
      }
      $('.wishlist-item .remove-product').on('click', async function (event) {
        const idProducts = $(this).closest('.wishlist-item').data('id');
        if (wishlistDetail?.products.length === 1) {
          await removeWishlist(wishlistId);
        } else {
          const confirm = createConfirm();
          $('body').append(confirm);

          confirm.find('button').on('click', async function (event) {
            const buttonId = event.target.id;
            confirm.remove();
            if (buttonId === 'confirm-yes') {
              $('#my-wishlist-detail-content').empty();
              loader = await renderLoader();
              $('#my-wishlist-detail-content').append(loader);

              const obj = {
                store: storeDomain,
                idProducts: [idProducts],
              };

              const requestOptions = {
                method: 'POST',
                body: JSON.stringify(obj),
                redirect: 'follow',
              };

              const response = await fetch(`${appUrl}/wishlist/${wishlistId}/product/delete`, requestOptions);
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }

              const gw = await getWishlist(customerId, storeDomain);
              if (gw) showWishlistDetail(wishlistId);
            }
          });
        }
      });

      $('.wishlist-item .select-size').on('click', async function (event) {
        const idProducts = $(this).closest('.wishlist-item').data('product-id');
        const _id = $(this).closest('.wishlist-item').data('id');
        $('#my-wishlist-detail-content').empty();
        loader = await renderLoader();
        $('#my-wishlist-detail-content').append(loader);

        function capsuleOnClick(selected) {
          console.log('capsuleOnClick =>', selected);
        }
        const product = await getProductById(idProducts);
        if (product) {
          console.log('product =>', product);
          const productDetail = wishlistDetail?.products.find((e) => e._id === _id);
          console.log('productDetail =>', productDetail);

          const obj = {
            ...product,
            priceCurrency: productDetail.productPriceCurrency,
            productVariant: productDetail.productVariant,
          };
          const rpd = await renderProductDetail(obj);
          if (rpd) {
            $('#my-wishlist-detail-content').find('.render-loader').remove();
            $('#my-wishlist-detail-content').append(rpd);
            const groupedData = groupByProperty(wishlistDetail.products, 'capsule');
            const capsuleData = Object.keys(groupedData);
            if (capsuleData) {
              const cCapsule = $('#my-wishlist-detail-content .column-details .select-botton-container');
              const dCapsule = cCapsule.find('.dropdown');
              const dcCapsule = dCapsule.find('.dropdown-content');

              if (productDetail?.capsule) dCapsule.find('span').text(productDetail?.capsule);

              setupDropdownContent(dcCapsule, capsuleData);
              dCapsule.on('click', () => {
                dcCapsule.css('display', dcCapsule.css('display') === 'block' ? 'none' : 'block');
              });
              dcCapsule.on('click', async (event) => {
                const dataId = event.target.getAttribute('data-id');
                dCapsule.find('span').text(dataId);

                console.log('click =>', {
                  _id: _id,
                  wishlistId: wishlistId,
                  capsule: dataId,
                });

                // add loader
                dCapsule.css('display', 'none');
                //cCapsule.append
                loader = await renderLoader('0');
                cCapsule.append(loader);

                const b = {
                  wishlistId: wishlistId,
                  product: {
                    store: storeDomain,
                    product: {
                      _id: _id,
                      productId: idProducts,
                      capsule: dataId,
                    },
                  },
                };

                const uc = await updateCapsule(b);
                console.log('updateCapsule =>', updateCapsule);

                await new Promise((resolve) => setTimeout(resolve, 2000));
                cCapsule.find('.render-loader').remove();
                dCapsule.css('display', 'block');

                if (uc && uc.success) {
                  await getWishlist(userId, storeDomain);
                  const notif = createNotification(`<div class="flex">
                                      <img src="${product.featured_image}" width="64">
                                      <div class="block px-3 w-full">
                                          <p>
                                              <span class="font-bold">${wishlistDetail.name} Capsule</span> has been changed to
                                              <span class="font-bold">${dataId}</span> successfully.
                                          </p>
                                      </div>
                                  </div>`);
                  $('body').append(notif);
                  notif.find('.modal-content')[0].classList.add('animate__animated', 'animate__slideInDown');

                  await new Promise((resolve) => setTimeout(resolve, 2500));
                  notif.remove();
                  showWishlistDetail(wishlistId);
                }
              });
            }

            const formActions = $('#my-wishlist-detail-content').find('.product-form .form-actions');
            formActions.find('button').on('click', async function (event) {
              const selectedSize = $(".single-option-radio input[name='size']:checked");
              console.log('selectedSize =', selectedSize);
              if (selectedSize.length > 0) {
                const selectedSizeValue = selectedSize.val();
                const items = [
                  {
                    variant_id: selectedSizeValue,
                    quantity: 1,
                  },
                ];

                console.log('info =>', {
                  productDetail: productDetail,
                  wishlistDetail: wishlistDetail ? wishlistDetail : '',
                });
                const newWishlistDetail = {
                  ...wishlistDetail,
                  products: [productDetail], // Replace the products array with a new array containing productDetail
                };
                //wishlistDetail.products = productDetail
                await handleWishlistUpdate(newWishlistDetail, items, true);
                /*
                            const confirm = createConfirm(`Are you sure want to add ${productDetail?.productName} to cart? `);
                            $('body').append(confirm);
                            confirm.find("button").off('click')
                            confirm.find("button").on('click', async function (event) {
                                confirm.remove();
                                if (event.target.id === 'confirm-yes') {
                                    const selectedSizeValue = selectedSize.val();
                                    const items = [{
                                        id: selectedSizeValue,
                                        quantity: 1
                                    }]
                                    const obj = {
                                        productImage: productDetail?.productImage,
                                        name: productDetail?.productName
                                    }

                                    formActions.find('button').css('display','none');
                                    loader = await renderLoader('0px');
                                    formActions.append(loader);

                                    const atc = await addToCart(items, obj, false);
                                    if(atc && atc.success ) {
                                        window.location.href = "/cart"
                                    }

                                }
                            })
                            */
              } else {
                console.log('No size selected.');
              }
            });
          }

          $('#my-wishlist-detail-content')
            .find('.collapsible')
            .on('click', function (event) {
              const buttonId = event.target.getAttribute('data-button-id');
              const contentId = $(event.currentTarget).attr('data-content-id');
              const content = $(`#${contentId}`);
              if (content.css('display') === 'block') {
                content.css('display', 'none');
                $(this).find('.btn-collaps').text('+');
              } else {
                content.css('display', 'block');
                $(this).find('.btn-collaps').text('-');
              }
            });
        }
      });

      const comments = wishlistDetail.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      handlelistComment(true, true, comments);

      myWishlistDetail.find('.btn-chevron').on('click', function () {
        const classExpand = $(this).attr('class');
        let isOpen = true;
        if (classExpand.includes('open-expand')) {
          // If "open" class exists, remove it
          $(this).removeClass('open-expand');
          isOpen = false;
        } else {
          // If "open" class does not exist, add it
          $(this).addClass('open-expand');
        }

        if (isOpen) myWishlistDetail.find('.comment .btn-chevron').addClass('open-expand');
        else myWishlistDetail.find('.comment .btn-chevron').removeClass('open-expand');

        if (myWishlistDetail.find('.expand-comment').hasClass('open-expand'))
          myWishlistDetail.find('.expand-comment').click();
        else handlelistComment(true, isOpen, comments);
      });

      myWishlistDetail.find('.expand-comment').on('click', async function () {
        const classExpand = $(this).attr('class');
        let isOpen = true;
        if (classExpand.includes('open-expand')) {
          // If "open" class exists, remove it
          $(this).removeClass('open-expand');
          isOpen = false;
        } else {
          // If "open" class does not exist, add it
          $(this).addClass('open-expand');
        }

        handlelistComment(false, isOpen, comments);
      });

      myWishlistDetail.find('#submitComment').on('click', async function () {
        const comments = myWishlistDetail.find('#wishlistComment').val();

        $('#my-wishlist-detail #submitComment').css({ display: 'none' });
        loader = await renderLoader('0');
        $('#my-wishlist-detail .submit-comment').append(loader);
        const result = await addComment({
          comments: comments,
          wishlistId: wishlistId,
        });
        console.log('addComment result:', result);
        if (result?.success) {
          await getWishlist(userId, store);
          //const notification = createNotification();
          setTimeout(() => {
            $('#my-wishlist-detail .submit-comment .render-loader').remove();
            $('#my-wishlist-detail #submitComment').css({ display: '' });
            myWishlistDetail.find('#submitComment').prop('disabled', true);
            $('#wishlistComment').value = '';
            document.querySelector('#wishlistComment').value = '';
            const lastComment =
              result.data.comments.length > 0 ? result.data.comments[result.data.comments.length - 1] : null;

            const commentsCount = result.data.comments.length > 0 ? result.data.comments.length : 0;
            myWishlistDetail.find('.comments-count P').text(`Comments (${commentsCount})`);

            const newComment = renderComment(lastComment);
            myWishlistDetail.find('#list-comment').append(newComment);
          }, 3000);
        }
      });

      const dManage = myWishlistDetail.find('.sub-heading .manage-wishlist');
      //const dManage = myWishlistDetail.find('#manage-wishlist');
      const dcManage = dManage.find('.dropdown-content');
      dManage.off('click');
      dManage.on('click', (event) => {
        event.stopPropagation();
        dcManage.css('display', dcManage.css('display') === 'block' ? 'none' : 'block');
      });
      $(document).on('click', (event) => {
        if (dcManage.is(':visible')) dcManage.hide();
      });

      dcManage.off('click');
      dcManage.on('click', async (event) => {
        const dataId = event.target.getAttribute('data-id');
        if (dataId === 'Remove Wishlist') {
          await removeWishlist(wishlistId);
        } else if (dataId === 'Duplicate Wishlist') {
          const name = wishlistDetail?.name;
          const confirm = createDuplicate(name ? name : '');
          $('body').append(confirm);

          confirm.find('#btn-close').off('click');
          confirm.find('#btn-close').on('click', function () {
            confirm.remove();
          });

          confirm.find('button').off('click');
          confirm.find('button').on('click', async function (event) {
            const buttonId = event.target.id;

            if (buttonId === 'btn-save') {
              const wishlistName = confirm.find('#txtWishlist').val().trim();
              if (wishlistName === '') {
                confirm.find('#txtWishlist')[0].classList.add('warning');
                return;
              }
              confirm.remove();

              $('#my-wishlist-detail-content').empty();
              loader = await renderLoader();
              $('#my-wishlist-detail-content').append(loader);
              await new Promise((resolve) => setTimeout(resolve, 1000)); // add delay

              const obj = {
                store: storeDomain,
                name: confirm.find('#txtWishlist').val(),
                createdBy: {
                  first_name,
                  last_name,
                  email,
                  userId,
                },
              };

              const requestOptions = {
                method: 'POST',
                body: JSON.stringify(obj),
                redirect: 'follow',
              };

              const response = await fetch(`${appUrl}/wishlist/${wishlistId}/duplicate`, requestOptions);
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }

              const result = await response.json();
              await new Promise((resolve) => setTimeout(resolve, 1500)); // add delay
              const gw = await getWishlist(customerId, storeDomain);
              if (gw) {
                $('#my-wishlist-modal').remove();
                openWishlistList();
              }
            } else {
              confirm.remove();
            }
          });
        } else {
          console.log('Add Item =>', wishlistId);
          setCookie('wishlistId', wishlistId, 1);
          $('#my-wishlist-modal').remove();
          window.location.href = '/collections/all';
        }
      });

      const cShare = myWishlistDetail.find('.sub-heading .btn-share');
      cShare.off('click'); // Unbind previous click events
      cShare.on('click', async (event) => {
        await shareWishlist(wishlistId);
      });
      const cAddToCart = myWishlistDetail.find('.sub-heading .btn-add-to-cart');
      cAddToCart.off('click');
      cAddToCart.on('click', async (event) => {
        await handleWishlistUpdate(wishlistDetail, [], true);
      });
    };

    const removeWishlist = async (wishlistId) => {
      const confirm = createConfirm();
      $('body').append(confirm);
      confirm.find('button').off('click');
      confirm.find('button').on('click', async function (event) {
        const buttonId = event.target.id;
        confirm.remove();
        if (buttonId === 'confirm-yes') {
          $('#my-wishlist-detail-content').empty();
          loader = await renderLoader();
          $('#my-wishlist-detail-content').append(loader);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // add delay
          const requestOptions = {
            method: 'POST',
            body: JSON.stringify({ store: storeDomain }),
            redirect: 'follow',
          };
          const response = await fetch(`${appUrl}/wishlist/${wishlistId}/delete`, requestOptions);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          await new Promise((resolve) => setTimeout(resolve, 1500)); // add delay
          const gw = await getWishlist(customerId, storeDomain);
          if (gw) {
            $('#my-wishlist-modal').remove();
            openWishlistList();
          }
        }
      });
    };
    const shareWishlist = async (wishlistId) => {
      const wishlistDetail = wishlistData.find((e) => e._id == wishlistId);
      const name = `${first_name} ${last_name}`;

      const confirm = createShare(name ? name : '');

      const sender = confirm.find('#txtSenderr').val();
      let storeDetails = getLocalStorage('storeSetting');
      storeDetails = typeof storeDetails === 'string' ? JSON.parse(storeDetails) : storeDetails;
      const storeId = storeDetails._id ? storeDetails._id : '';

      $('body').append(confirm);

      confirm.find('#btn-close').on('click', function () {
        confirm.remove();
      });

      confirm.find('.copy-link').on('click', function () {
        copyLink(`${store}/pages/share-wishlist?id=${wishlistId}`);
        let notification = document.getElementById('copyLinkNotification');
        notification.style.display = 'block';

        setTimeout(function () {
          notification.style.display = 'none';
        }, 1500);
      });

      confirm.find('.share-facebook').on('click', async function () {
        // Add log
        const obj = {
          sender,
          receipent: '',
          message: 'Share via Facebook',
          wishlistId,
          storeId,
          type: 'social-media',
          createdBy: {
            first_name,
            last_name,
            email,
            userId,
          },
        };

        const requestOptions = {
          method: 'POST',
          body: JSON.stringify(obj),
          redirect: 'follow',
        };

        const response = await fetch(`${appUrl}/wishlist/${wishlistId}/share`, requestOptions);
        if (!response.ok) {
          //throw new Error('Network response was not ok');
        }

        // Create a unique name for the popup window to ensure it opens a new window each time
        var popupWindowName = 'Share Wishlist Via Facebook';
        // Open the Facebook sharing link in a popup window
        var popupWindow = window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${store}/pages/share-wishlist?${wishlistId}`,
          popupWindowName,
          'width=600,height=400'
        );
      });

      confirm.find('.share-twitter').on('click', async function () {
        // Add log
        const obj = {
          sender,
          receipent: '',
          message: 'Share via Twitter',
          wishlistId,
          storeId,
          type: 'social-media',
          createdBy: {
            first_name,
            last_name,
            email,
            userId,
          },
        };

        const requestOptions = {
          method: 'POST',
          body: JSON.stringify(obj),
          redirect: 'follow',
        };

        const response = await fetch(`${appUrl}/wishlist/${wishlistId}/share`, requestOptions);
        if (!response.ok) {
          //throw new Error('Network response was not ok');
        }

        var popupWindowName = 'Share Wishlist Via Twitter';
        var tweetText = encodeURIComponent('Check out my awesome wishlist on this website!');
        var popupWindow = window.open(
          `https://twitter.com/intent/tweet?text=${tweetText}&url=${store}/pages/share-wishlist?${wishlistId})`,
          popupWindowName,
          'width=600,height=400'
        );
      });

      confirm.find('#btn-share').on('click', async function () {
        const sender = confirm.find('#txtSenderr').val();
        const receipent = confirm.find('#txtRecipient').val();
        const message = confirm.find('#txtMessage').val();
        const store = getLocalStorage('storeSetting');
        const storeId = store._id ? store._id : '';

        const obj = {
          sender,
          receipent,
          message,
          wishlistId,
          storeId,
          type: 'email',
          createdBy: {
            first_name,
            last_name,
            email,
            userId,
          },
        };

        let isTrue = 0;
        const emailRegex =
          /^(\s*[\w\.-]+@[a-zA-Z\d\.-]+\s*|\s*[\w\.-]+(\+[a-zA-Z\d]+)?@[a-zA-Z\d\.-]+\s*)(,\s*[\w\.-]+@[a-zA-Z\d\.-]+\s*|\s*[\w\.-]+(\+[a-zA-Z\d]+)?@[a-zA-Z\d\.-]+\s*)*$/;

        if (obj.sender === '') {
          confirm.find('#txtSenderr')[0].classList.add('warning');
          isTrue++;
        } else {
          confirm.find('#txtSenderr')[0].classList.remove('warning');
        }

        if (obj.receipent === '' || !emailRegex.test(obj.receipent)) {
          confirm.find('#txtRecipient')[0].classList.add('warning');
          isTrue++;
        } else {
          confirm.find('#txtRecipient')[0].classList.remove('warning');
        }

        if (obj.message === '') {
          confirm.find('#txtMessage')[0].classList.add('warning');
          isTrue++;
        } else {
          confirm.find('#txtMessage')[0].classList.remove('warning');
        }

        if (isTrue > 0) return;

        confirm.find('#btn-share').css({ display: 'none' });
        confirm.find('.loader').css({ display: 'block' });

        const requestOptions = {
          method: 'POST',
          body: JSON.stringify(obj),
          redirect: 'follow',
        };

        const response = await fetch(`${appUrl}/wishlist/${wishlistId}/share`, requestOptions);
        if (!response.ok) {
          //throw new Error('Network response was not ok');
        }

        //const result = await response.json();
        await new Promise((resolve) => setTimeout(resolve, 1500)); // add delay
        confirm.remove();

        const notif = createNotification(`<div class="flex">
                  <img src="${wishlistDetail.products[0].productImage}" width="64">
                  <div class="block px-3 w-full">
                      <p>
                          <span class="font-bold">${wishlistDetail.name} </span> has been shared to
                          <span class="font-bold">${receipent}</span> successfully.
                      </p>
                  </div>
              </div>`);
        $('body').append(notif);
        notif.find('.modal-content')[0].classList.add('animate__animated', 'animate__slideInDown');

        setTimeout(() => {
          notif.remove();
        }, 3000);
      });
    };

    // // --- end wislist list --

    async function updateCapsule(data) {
      try {
        const productData = {
          method: 'POST',
          // headers: myHeaders,
          body: JSON.stringify(data.product),
          redirect: 'follow',
        };
        const response = await fetch(appUrl + '/wishlist/' + data?.wishlistId + '/product/update', productData);
        if (!response.ok) {
          return { success: false };
        } else {
          const result = await response.json();
          console.log('result =>', result);
          return { success: true, data: result };
        }
      } catch (error) {
        return { success: false };
      }
    }

    async function getProductDetail(prodId) {
      let res = null;

      var myHeaders = new Headers();
      myHeaders.append('X-Shopify-Access-Token', 'shpua_0f9f518a8006aba135ffc58b45ea65b3'); //currently, hardcoded
      myHeaders.append('Content-Type', 'application/json');

      const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
      };
      const response = await fetch(
        `https://${window.location.hostname}/admin/api/2024-01/products/${prodId}.json`,
        requestOptions
      );
      if (response.ok) {
        const result = await response.json();
        res = result;
      }

      return res;
    }

    async function getStoreAlert(storeId) {
      let res = null;

      const requestOptions = {
        method: 'GET',
        redirect: 'follow',
      };
      const response = await fetch(`${appUrl}/alert/backinstock/${storeId}`, requestOptions);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      res = await response.json();

      return res;
    }

    async function createAlertProduct(paramObj, storeSetting) {
      const requestOptions = {
        method: 'POST',
        body: JSON.stringify(paramObj),
        redirect: 'follow',
      };

      try {
        const response = await fetch(appUrl + '/alert/backinstock/' + storeSetting._id, requestOptions);
        if (!response.ok) {
          console.log('jjjj');
        } else {
          location.reload();
          console.log('mmmmm', response);
        }
      } catch (err) {
        console.log('hihihih', errr);
      }
    }

    async function renderAlertBtn(storeAlertConf, custEmail, reqAlertsParam) {
      let btnTypeRes = '';

      if (storeAlertConf && storeAlertConf.data) {
        console.log('vvv');
        const defaultLabel = 'Remind me when available';
        const svgBell = `<svg style="fill: ${storeAlertConf?.data?.buttonSettings?.textColor}" height="1em" width="1em" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M912 1696q0-16-16-16-59 0-101.5-42.5t-42.5-101.5q0-16-16-16t-16 16q0 73 51.5 124.5t124.5 51.5q16 0 16-16zm816-288q0 52-38 90t-90 38h-448q0 106-75 181t-181 75-181-75-75-181h-448q-52 0-90-38t-38-90q50-42 91-88t85-119.5 74.5-158.5 50-206 19.5-260q0-152 117-282.5t307-158.5q-8-19-8-39 0-40 28-68t68-28 68 28 28 68q0 20-8 39 190 28 307 158.5t117 282.5q0 139 19.5 260t50 206 74.5 158.5 85 119.5 91 88z"/></svg>`;

        const btnType1 = `
            <button id="backinstock-alert" class="backinstock-alert"
            style="color:${storeAlertConf?.data?.buttonSettings?.textColor}; background-color: ${storeAlertConf?.data?.buttonSettings?.color
          }">
                <div style="margin-right: 10px;"> ${svgBell} </div>
                ${storeAlertConf?.data?.buttonSettings?.label ?? defaultLabel}
            </button>`;

        const btnType2 = `
            <button id="backinstock-alert" class="backinstock-alert"
            style="color:${storeAlertConf?.data?.buttonSettings?.textColor}; background-color: ${storeAlertConf?.data?.buttonSettings?.color
          }">
                ${storeAlertConf?.data?.buttonSettings?.label ?? defaultLabel}
            </button>`;

        const btnType3 =
          '<svg id="backinstock-alert" style="cursor: pointer; fill: ' +
          storeAlertConf?.data?.buttonSettings?.color +
          '" xmlns="http://www.w3.org/2000/svg" height="2.5em" viewBox="0 0 512 512"><path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7" /></svg>';

        if (storeAlertConf.data.buttonSettings.buttonType == 1) btnTypeRes = btnType1;
        else if (storeAlertConf.data.buttonSettings.buttonType == 2) btnTypeRes = btnType2;
        else if (storeAlertConf.data.buttonSettings.buttonType == 3) btnTypeRes = btnType3;
      }

      return btnTypeRes;
    }

    if (parseInt(invQty) < 1) {
      const storeAlertConf = await getStoreAlert(storeSetting._id);

      const productDetail = await getProductDetail(productId);
      console.log('productDetail', productDetail);

      let reqAlerts; // variable that indicating user able to click alert btn or not

      if (storeAlertConf && storeAlertConf.data && storeAlertConf.data.id) {
        reqAlerts = storeAlertConf.data.requestedAlertList?.find(
          (x) =>
            x?.requestedBy?.email == custEmail &&
            x?.inventoryItemId == productDetail.product.variants[0].inventory_item_id
        );

        const newDiv = $('<div>', {
          class: 'newDiv',
        });

        let btnType = await renderAlertBtn(storeAlertConf, custEmail, reqAlerts);
        console.log('show please', btnType);

        const alertBtn = newDiv.append(btnType);

        $('.product-form').append(alertBtn);
      }

      if (reqAlerts) {
        $('#backinstock-alert').hover(function () {
          $(this).css({
            cursor: 'not-allowed',
            // Add any other styles to indicate not allowed
          });
        });
      }

      $('#backinstock-alert').on('click', async function () {
        if (!custEmail) {
          // openLoginModal();
          redirectToLogin()
        } else {
          const paramObj = {
            action: 'addAlertToProduct',
            params: {
              storeId: storeSetting._id,
              inventoryItemId: productDetail.product.variants[0].inventory_item_id,
              productId: productDetail.product.id,
              productURL: productURL,
              productTitle: productDetail.product.title,
              productImgURL: productDetail.product.images[0].src ?? '',
              productPrice: productPrice,
              requestedBy: {
                name: `${custFName} ${custLName}`,
                email: custEmail,
              },
              isStockAvailable: Number(invQty) > 0 ? true : false,
            },
          };

          if (!reqAlerts) {
            const doCreateAlert = await createAlertProduct(paramObj, storeSetting);
          }
        }
      });
    }
  } else {
    throw new Error('Unauthorized.');
  }
}
